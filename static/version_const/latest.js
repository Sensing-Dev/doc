//THIS IS WHERE YOU UPDATE
const is_latest = true;
const latest_version = 'v25.01.02';
const latest_winUSB_URL = "v24.02.02"
const ion_python_version = '3.2.7'
const gendc_python_version = '0.4.1'
const aravis_python_version = '0.8.31.dev1'

const GenerateVersionInfo = require('./generate_version_info.js');

const {
    latest_installer_URL,
    one_line_powershell,
    one_line_install,
    tutorial_version,
    latest_setup_URL,
    windows_version_option,
    linux_version
} = GenerateVersionInfo({is_latest, latest_version, latest_winUSB_URL})

const windows_uninstaller_url = "https://github.com/Sensing-Dev/sensing-dev-installer/releases/download/" + latest_version + "/uninstaller.ps1";
const windows_pygobject_url = "https://github.com/Sensing-Dev/sensing-dev-installer/releases/download/" + latest_version + "/pygobject_installer.ps1"
const windows_opencvpython_url = "https://github.com/Sensing-Dev/sensing-dev-installer/releases/download/" + latest_version + "/opencv_python_installer.ps1"

module.exports = {
    is_latest, 
    latest_version,
    latest_installer_URL,
    one_line_powershell,
    one_line_install,
    tutorial_version,
    latest_setup_URL,
    ion_python_version,
    gendc_python_version,
    aravis_python_version,
    windows_version_option,
    linux_version,
    windows_uninstaller_url,
    windows_pygobject_url,
    windows_opencvpython_url
};
