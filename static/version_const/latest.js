//THIS IS WHERE YOU UPDATE
const is_latest = true;
const latest_version = 'v24.04.00-test2';
const latest_winUSB_URL = "v24.02.02"

const GenerateVersionInfo = require('./generate_version_info.js');

const {
    latest_installer_URL,
    one_line_powershell,
    one_line_install,
    tutorial_version,
    latest_setup_URL
} = GenerateVersionInfo({is_latest, latest_version, latest_winUSB_URL})

module.exports = {
    is_latest, 
    latest_version,
    latest_installer_URL,
    one_line_powershell,
    one_line_install,
    tutorial_version,
    latest_setup_URL
};
