declare module 'lucide-react-native' {
  import { ComponentType } from 'react';
  import { SvgProps } from 'react-native-svg';

  export interface IconProps extends SvgProps {
    size?: number;
    color?: string;
    strokeWidth?: number;
  }

  export const Heart: ComponentType<IconProps>;
  export const Users: ComponentType<IconProps>;
  export const User: ComponentType<IconProps>;
  export const MapPin: ComponentType<IconProps>;
  export const Clock: ComponentType<IconProps>;
  export const Phone: ComponentType<IconProps>;
  export const Globe: ComponentType<IconProps>;
  export const Star: ComponentType<IconProps>;
  export const X: ComponentType<IconProps>;
  export const ChevronLeft: ComponentType<IconProps>;
  export const ChevronDown: ComponentType<IconProps>;
  export const ChevronUp: ComponentType<IconProps>;
  export const RotateCcw: ComponentType<IconProps>;
  export const ThumbsUp: ComponentType<IconProps>;
  export const Calendar: ComponentType<IconProps>;
  export const Navigation: ComponentType<IconProps>;
  export const Share: ComponentType<IconProps>;
  export const Bookmark: ComponentType<IconProps>;
  export const ExternalLink: ComponentType<IconProps>;
  export const ZoomIn: ComponentType<IconProps>;
  export const Settings: ComponentType<IconProps>;
  export const Menu: ComponentType<IconProps>;
  export const Search: ComponentType<IconProps>;
  export const Filter: ComponentType<IconProps>;
  export const Plus: ComponentType<IconProps>;
  export const Minus: ComponentType<IconProps>;
  export const Edit: ComponentType<IconProps>;
  export const Trash: ComponentType<IconProps>;
  export const Save: ComponentType<IconProps>;
  export const Download: ComponentType<IconProps>;
  export const Upload: ComponentType<IconProps>;
  export const Refresh: ComponentType<IconProps>;
  export const ArrowLeft: ComponentType<IconProps>;
  export const ArrowRight: ComponentType<IconProps>;
  export const ArrowUp: ComponentType<IconProps>;
  export const ArrowDown: ComponentType<IconProps>;
  export const Check: ComponentType<IconProps>;
  export const AlertCircle: ComponentType<IconProps>;
  export const Info: ComponentType<IconProps>;
  export const HelpCircle: ComponentType<IconProps>;
  export const Eye: ComponentType<IconProps>;
  export const EyeOff: ComponentType<IconProps>;
  export const Lock: ComponentType<IconProps>;
  export const Unlock: ComponentType<IconProps>;
  export const Home: ComponentType<IconProps>;
  export const Bell: ComponentType<IconProps>;
  export const BellOff: ComponentType<IconProps>;
  export const MessageCircle: ComponentType<IconProps>;
  export const Send: ComponentType<IconProps>;
  export const Link: ComponentType<IconProps>;
  export const Copy: ComponentType<IconProps>;
  export const File: ComponentType<IconProps>;
  export const Folder: ComponentType<IconProps>;
  export const Image: ComponentType<IconProps>;
  export const Video: ComponentType<IconProps>;
  export const Music: ComponentType<IconProps>;
  export const Play: ComponentType<IconProps>;
  export const Pause: ComponentType<IconProps>;
  export const Stop: ComponentType<IconProps>;
  export const Volume2: ComponentType<IconProps>;
  export const VolumeX: ComponentType<IconProps>;
  export const Wifi: ComponentType<IconProps>;
  export const Battery: ComponentType<IconProps>;
  export const Signal: ComponentType<IconProps>;
  export const Bluetooth: ComponentType<IconProps>;
  export const Camera: ComponentType<IconProps>;
  export const Mic: ComponentType<IconProps>;
  export const MicOff: ComponentType<IconProps>;
  export const Speaker: ComponentType<IconProps>;
  export const Headphones: ComponentType<IconProps>;
  export const Radio: ComponentType<IconProps>;
  export const Tv: ComponentType<IconProps>;
  export const Monitor: ComponentType<IconProps>;
  export const Smartphone: ComponentType<IconProps>;
  export const Tablet: ComponentType<IconProps>;
  export const Laptop: ComponentType<IconProps>;
  export const Desktop: ComponentType<IconProps>;
  export const Watch: ComponentType<IconProps>;
  export const Gamepad: ComponentType<IconProps>;
  export const Joystick: ComponentType<IconProps>;
  export const Controller: ComponentType<IconProps>;
  export const Keyboard: ComponentType<IconProps>;
  export const Mouse: ComponentType<IconProps>;
  export const Printer: ComponentType<IconProps>;
  export const Scanner: ComponentType<IconProps>;
  export const Fax: ComponentType<IconProps>;
  export const Projector: ComponentType<IconProps>;
  export const Screen: ComponentType<IconProps>;
  export const Display: ComponentType<IconProps>;
  export const Mail: ComponentType<IconProps>;
  export const Shield: ComponentType<IconProps>;
  export const CreditCard: ComponentType<IconProps>;
  export const LogOut: ComponentType<IconProps>;
  export const ChevronRight: ComponentType<IconProps>;
  export const Zap: ComponentType<IconProps>;
  export const Infinity: ComponentType<IconProps>;
  
  // Add other icons as needed
  const LucideReactNative: {
    [key: string]: ComponentType<IconProps>;
  };
  
  export default LucideReactNative;
}

// Declare modules for direct icon imports
declare module 'lucide-react-native/dist/esm/icons/mail' {
  import { ComponentType } from 'react';
  import { IconNode } from 'lucide-react-native';
  const Mail: ComponentType<IconProps>;
  export default Mail;
}

declare module 'lucide-react-native/dist/esm/icons/shield' {
  import { ComponentType } from 'react';
  import { IconNode } from 'lucide-react-native';
  const Shield: ComponentType<IconProps>;
  export default Shield;
}

declare module 'lucide-react-native/dist/esm/icons/credit-card' {
  import { ComponentType } from 'react';
  import { IconNode } from 'lucide-react-native';
  const CreditCard: ComponentType<IconProps>;
  export default CreditCard;
}

declare module 'lucide-react-native/dist/esm/icons/log-out' {
  import { ComponentType } from 'react';
  import { IconNode } from 'lucide-react-native';
  const LogOut: ComponentType<IconProps>;
  export default LogOut;
}

declare module 'lucide-react-native/dist/esm/icons/chevron-right' {
  import { ComponentType } from 'react';
  import { IconNode } from 'lucide-react-native';
  const ChevronRight: ComponentType<IconProps>;
  export default ChevronRight;
}

declare module 'lucide-react-native/dist/esm/icons/zap' {
  import { ComponentType } from 'react';
  import { IconNode } from 'lucide-react-native';
  const Zap: ComponentType<IconProps>;
  export default Zap;
}

declare module 'lucide-react-native/dist/esm/icons/infinity' {
  import { ComponentType } from 'react';
  import { IconNode } from 'lucide-react-native';
  const Infinity: ComponentType<IconProps>;
  export default Infinity;
}