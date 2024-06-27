import os.path
import pathlib

root_dir = pathlib.Path(os.path.dirname(__file__)).parent.absolute()
current = {'eng': 'docs', 'jpn': 'i18n\ja\docusaurus-plugin-content-docs\current'}
prefix = 'version-'

def check_md_file_content(filename, version_num):
    if filename.endswith('.md') or filename.endswith('.mdx'):
        with open(filename, mode='r', encoding='utf8') as ifs:
            while line := ifs.readline():
                # md file loading version config js file
                if 'import' in line and '@site/static/version_const' in line and 'js' in line:
                    if version_num == 'latest':
                        if not 'latest.js' in line:
                            return False
                    else:
                        if not version_num.replace('.', '') in line:
                            return False
    return True

def get_dir_content(relative_dir_path, version_num):

    if os.path.isdir(relative_dir_path):
        # relative_dir = pathlib.Path(os.path.join(root_dir, relative_dir_path))
        relative_dir = pathlib.Path(root_dir, relative_dir_path)
        for item_in_dir in relative_dir.iterdir():
            get_dir_content(item_in_dir, version_num)
    elif os.path.isfile(relative_dir_path):
        if not check_md_file_content(relative_dir_path.__str__(), version_num):
            print(relative_dir_path.__str__() + ' does not exist')
    else:
        print(relative_dir_path + 'does ')


if __name__=='__main__':

    # current = {'eng': 'docs', 'jpn': 'i18n\ja\docusaurus-plugin-content-docs\current'}
    versioned_dirs = ['v23.11', 'v24.01', 'v24.05']

    for lng in current:
        get_dir_content(current[lng], 'latest')


    for ver in versioned_dirs:
        
        eng_path = os.path.join('versioned_docs', prefix + ver)
        get_dir_content(eng_path, ver)

        jpn_path = os.path.join('i18n/ja/docusaurus-plugin-content-docs', prefix + ver)
        get_dir_content(jpn_path, ver)

