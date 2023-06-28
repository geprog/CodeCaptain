import os

def generate_project_structure_description(project_path):
    repo_path = os.path.join(project_path, 'repo')
    
    initial_template = 'The folder structure of the Project is described below.\n'

    no_files = 'contains no files'
    no_folders = 'contains no folders'

    folders_existing = 'contains the folders called '
    files_existing = 'also contains files called'
    
    body_desc = ''
    for (path,folder_names, file_names) in os.walk(repo_path):
        parent_folder = path.split(os.sep)[-1]
        folders_desc = 'Folder {} {}'.format(parent_folder, ('{} {}'.format(folders_existing, folder_names)) if len(folder_names) != 0 else no_folders)
        files_desc = 'Folder {} {}'.format(parent_folder, ('{} {}'.format(files_existing, file_names)) if len(file_names) != 0 else no_files)

        body_desc = '{}\n {} {}'.format(body_desc, folders_desc, files_desc)
    
    with open(f'{project_path}/project-structure.txt', 'w+') as desc:
        desc.write('{} \n {}'.format(initial_template, body_desc))
    
