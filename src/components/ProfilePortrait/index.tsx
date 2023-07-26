import React, { useEffect, useState } from 'react';
import { Avatar } from 'primereact/avatar';

type ProfilePortraitProps = {
  imageUrl?: string | null | undefined,
  profileName: string,
  size?: 'large' | 'xlarge',
};

/**
 * Parses name initials from name or email address
 * @param name Name or email address to be parsed
 * @returns Initials (two or one letter) parsed from the name
 */
function parseInitials(name: string) : string {
  if(name.length === 0) {
    return "";
  }
  let parts = name.split('@')[0].replace(/[0-9]/g, '').replace("(me)", "").trim().split('.').join(";").split(" ").join(";").split(";");
  if(parts.length === 1) {
    if (parts[0] === "") {
      return name.substring(0,1)
    }
    return parts[0][0].toUpperCase();
  }
  else {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
}

function ProfilePortrait(props: ProfilePortraitProps) {
  const [ initials, setInitials ] = useState<string>("");

  useEffect(() => {
    setInitials(parseInitials(props.profileName));
  }, [props.imageUrl, props.profileName]);

  return <Avatar shape='circle' size={props.size} image={props.imageUrl ?? undefined} label={initials} />
}

export default ProfilePortrait;
