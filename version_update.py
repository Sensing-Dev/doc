import sys
import re
import os

replace_target = '@site/static/version_const/latest.js'

version_doc_dir = 'versioned_docs'
version_doc_prefix = 'version-'

def is_minor_version_format(s):
    pattern = r'^v\d{2}\.\d{2}$'
    return re.match(pattern, s) is not None

def get_subminor_version(version_str):
    parts = version_str.split('.')
    short_version = '.'.join(parts[:2])
    return short_version

def versioned_dir_name(shortened_version):
    return os.path.join(version_doc_dir, version_doc_prefix+shortened_version)

def versioned_ja_dir_name(shortened_version):
    return os.path.join('i18n', 'ja', 'docusaurus-plugin-content-docs', version_doc_prefix+shortened_version)

def version_file_name(version_str):
    result = '@site/static/version_const/' + version_str.replace('.', '') + '.js'
    return result

def version_file_path(version_str):
    return os.path.join('static', 'version_const', version_str.replace('.', '') + '.js')

def get_latest_version(js_file_path):
    with open(js_file_path, 'r', encoding='utf-8') as file:
        content = file.read()

    match = re.search(r"const latest_version = '([^']+)';", content)
    if match:
        return match.group(1)
    else:
        return None

def generate_js_file(src_path, dest_path):
    # 元のJavaScriptファイルを読み込む
    with open(src_path, 'r', encoding='utf-8') as file:
        content = file.read()
    
    modified_content = content.replace('const is_latest = true;', 'const is_latest = false;')
    
    with open(dest_path, 'w', encoding='utf-8') as file:
        file.write(modified_content)

def replace_string_in_files(directory, stringA, stringB):
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.md') or file.endswith('.mdx'):
                file_path = os.path.join(root, file)
                # ファイルの内容を読み込む
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                new_content = content.replace(stringA, stringB)
                
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)

if __name__ == '__main__':

    if len(sys.argv) != 2 or not is_minor_version_format(sys.argv[1]):
        print('[Usage]\n\tpython3 '+ sys.argv[0]+ ' vXX.YY.ZZ' ) 
        exit

    minor_version = sys.argv[1]

    latest_js = os.path.join('static', 'version_const', 'latest.js')
    if not os.path.exists(latest_js):
        print('latest.js does not exist')
    subminor_version = get_latest_version(latest_js)
    js_file_name = version_file_name(subminor_version) 

    generate_js_file(latest_js, version_file_path(subminor_version))


    if not os.path.exists(versioned_dir_name(minor_version)):
        print('Version the document first\n\tnpm run docusaurus docs:version vXX.YY')
        exit

    replace_string_in_files(versioned_dir_name(minor_version), replace_target, version_file_name(subminor_version))

    if not os.path.exists(versioned_ja_dir_name(minor_version)):
        print('Version the document first\n\tnpm run docusaurus docs:version vXX.YY')
        exit

    replace_string_in_files(versioned_ja_dir_name(minor_version), replace_target, version_file_name(subminor_version))


    print(subminor_version, minor_version, js_file_name)




    