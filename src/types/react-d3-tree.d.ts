import 'react-d3-tree';

declare module 'react-d3-tree' {
  interface TreeProps {
    styles?: {
      links?: {
        stroke?: string;
        strokeWidth?: number;
        [key: string]: any;
      };
      nodes?: {
        node?: {
          circle?: {
            stroke?: string;
            strokeWidth?: number;
            fill?: string;
            [key: string]: any;
          };
          name?: {
            stroke?: string;
            fontWeight?: string;
            [key: string]: any;
          };
          [key: string]: any;
        };
        leafNode?: {
          circle?: {
            stroke?: string;
            strokeWidth?: number;
            fill?: string;
            [key: string]: any;
          };
          name?: {
            stroke?: string;
            fontWeight?: string;
            [key: string]: any;
          };
          [key: string]: any;
        };
        [key: string]: any;
      };
      [key: string]: any;
    };
  }
}
