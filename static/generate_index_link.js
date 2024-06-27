import React, { useEffect, useState } from 'react';

const GenerateLink = ({relative_path, full_version, title}) => {
    const [isValid, setIsValid] = useState(false);
    const short_version_num = full_version.replace(/(\.\d+)(\.\d+)$/, '$1');
    const versioned_url = "/" + short_version_num + relative_path

    
    

    useEffect(() => {
        const checkLink = async () => {
          try {
            const response = await fetch(versioned_url, {
              method: 'HEAD',
            });
            if (response.ok) {
              setIsValid(true);
            }
          } catch (error) {
            console.error('Error checking link:', error);
          }
        };
    
        checkLink();
      }, [versioned_url]);
    
      if (!isValid) {
        return <a className="card on-board" href={relative_path}>{title}</a>;
      }
      
    //   return <p>{versioned_url}</p>
      return <a className="card on-board" href={versioned_url}>{title}</a>;
    };

export default GenerateLink;