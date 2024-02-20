//THIS IS WHERE YOU UPDATE
const is_latest = false;
const latest_version = 'v24.01.04';
const latest_winUSB_URL = "v24.02.02"

const one_line_install_default = "powershell.exe -ExecutionPolicy Bypass -File installer.ps1 -user <username>";

const latest_URL = 'https://github.com/Sensing-Dev/sensing-dev-installer/releases/download/' + latest_version;
const latest_installer_URL = latest_URL + '/installer.ps1';

const one_line_install = (is_latest === true) ? one_line_install_default : one_line_install_default + " -version " + latest_version ;

// WinUSB

const one_line_powershell = "Invoke-WebRequest -Uri https://github.com/Sensing-Dev/WinUSB-installer-generator/releases/download/"+latest_winUSB_URL+"/generate_and_apply_WinUSB.ps1 -OutFile generate_and_apply_WinUSB.ps1 -Verbose; powershell.exe -ExecutionPolicy Bypass -File ./generate_and_apply_WinUSB.ps1"

module.exports = {
    is_latest, 
    latest_version,
    latest_installer_URL,
    one_line_powershell,
    one_line_install,
};
