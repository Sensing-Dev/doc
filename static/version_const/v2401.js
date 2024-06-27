//THIS IS WHERE YOU UPDATE
const is_latest = false;
const latest_version = 'v24.01.04';
const latest_winUSB_URL = "v24.02.02"
const ion_python_version = '1.6.0'
const gendc_python_version = '0.1.0'

const GenerateVersionInfo = require('./generate_version_info.js');

const {
    latest_installer_URL,
    one_line_powershell,
    one_line_install,
    tutorial_version,
} = GenerateVersionInfo({is_latest, latest_version, latest_winUSB_URL})

module.exports = {
    is_latest, 
    latest_version,
    latest_installer_URL,
    one_line_powershell,
    one_line_install,
    tutorial_version,
    ion_python_version,
    gendc_python_version
};
