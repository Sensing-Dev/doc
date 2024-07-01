import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

const user_install_en = " can open powershell terminal and type ";
const user_install_ja1 = "PowerShellターミナルを開いて";
const user_install_ja2 = "と入力します。";


const shorter_install_default = "installer.ps1 -user <username>";

const InstallCommandPowerShell = ({islatest, version}) => {
  const {siteConfig, i18n}  = useDocusaurusContext();
  
  if (islatest){
    return <p>You {user_install_en} <code>{shorter_install_default}</code>.</p>;
  }

  return <p></p>;

}

export default InstallCommandPowerShell;