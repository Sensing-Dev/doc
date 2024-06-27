import os.path
import pathlib

root_dir = pathlib.Path(os.path.dirname(__file__)).parent.absolute()
current = {'eng': 'docs', 'jpn': os.path.join('i18n/ja/docusaurus-plugin-content-docs', 'current')}
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

def get_dir_content(abs_path, version_num):

    if os.path.isdir(abs_path):
        # relative_dir = pathlib.Path(os.path.join(root_dir, abs_path)) 
        for item_in_dir in pathlib.Path(root_dir, abs_path).iterdir():
            get_dir_content(item_in_dir, version_num)
    elif os.path.isfile(abs_path):
        if not check_md_file_content(abs_path.__str__(), version_num):
            print(abs_path.__str__() + ' has wrong import module')
    else:
        print(abs_path + ' does not exist')


if __name__=='__main__':

    versioned_dirs = pathlib.Path(root_dir, 'versioned_docs')
    versioned_dirs = [v.__str__().split('\\')[-1].split('version-')[-1] for v in versioned_dirs.iterdir()]
    # This should return like: versioned_dirs = ['v23.11', 'v24.01', 'v24.05']

    for lng in current:
        get_dir_content(current[lng], 'latest')


    for ver in versioned_dirs:
        
        eng_path = os.path.join('versioned_docs', prefix + ver)
        get_dir_content(eng_path, ver)

        jpn_path = os.path.join('i18n/ja/docusaurus-plugin-content-docs', prefix + ver)
        get_dir_content(jpn_path, ver)

