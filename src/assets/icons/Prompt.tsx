export const StopIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={props.fill !== undefined ? props.fill : "currentColor"}
      stroke={props.stroke !== undefined ? props.stroke : "currentColor"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="Stop"
    >
      <title>Square</title>
      <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
    </svg>
  );
};

export const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (
  props
) => {
  return (
    <svg
      fill={props.fill !== undefined ? props.fill : "currentColor"}
      width={props.width || "800px"}
      height={props.height || "800px"}
      viewBox="0 0 56 56"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M 26.6875 12.6602 C 26.9687 12.6602 27.1094 12.4961 27.1797 12.2383 C 27.9062 8.3242 27.8594 8.2305 31.9375 7.4570 C 32.2187 7.4102 32.3828 7.2461 32.3828 6.9648 C 32.3828 6.6836 32.2187 6.5195 31.9375 6.4726 C 27.8828 5.6524 28.0000 5.5586 27.1797 1.6914 C 27.1094 1.4336 26.9687 1.2695 26.6875 1.2695 C 26.4062 1.2695 26.2656 1.4336 26.1953 1.6914 C 25.3750 5.5586 25.5156 5.6524 21.4375 6.4726 C 21.1797 6.5195 20.9922 6.6836 20.9922 6.9648 C 20.9922 7.2461 21.1797 7.4102 21.4375 7.4570 C 25.5156 8.2774 25.4687 8.3242 26.1953 12.2383 C 26.2656 12.4961 26.4062 12.6602 26.6875 12.6602 Z M 15.3438 28.7852 C 15.7891 28.7852 16.0938 28.5039 16.1406 28.0821 C 16.9844 21.8242 17.1953 21.8242 23.6641 20.5821 C 24.0860 20.5117 24.3906 20.2305 24.3906 19.7852 C 24.3906 19.3633 24.0860 19.0586 23.6641 18.9883 C 17.1953 18.0977 16.9609 17.8867 16.1406 11.5117 C 16.0938 11.0899 15.7891 10.7852 15.3438 10.7852 C 14.9219 10.7852 14.6172 11.0899 14.5703 11.5352 C 13.7969 17.8164 13.4687 17.7930 7.0469 18.9883 C 6.6250 19.0821 6.3203 19.3633 6.3203 19.7852 C 6.3203 20.2539 6.6250 20.5117 7.1406 20.5821 C 13.5156 21.6133 13.7969 21.7774 14.5703 28.0352 C 14.6172 28.5039 14.9219 28.7852 15.3438 28.7852 Z M 31.2344 54.7305 C 31.8438 54.7305 32.2891 54.2852 32.4062 53.6524 C 34.0703 40.8086 35.8750 38.8633 48.5781 37.4570 C 49.2344 37.3867 49.6797 36.8945 49.6797 36.2852 C 49.6797 35.6758 49.2344 35.2070 48.5781 35.1133 C 35.8750 33.7070 34.0703 31.7617 32.4062 18.9180 C 32.2891 18.2852 31.8438 17.8633 31.2344 17.8633 C 30.6250 17.8633 30.1797 18.2852 30.0860 18.9180 C 28.4219 31.7617 26.5938 33.7070 13.9140 35.1133 C 13.2344 35.2070 12.7891 35.6758 12.7891 36.2852 C 12.7891 36.8945 13.2344 37.3867 13.9140 37.4570 C 26.5703 39.1211 28.3281 40.8321 30.0860 53.6524 C 30.1797 54.2852 30.6250 54.7305 31.2344 54.7305 Z" />
    </svg>
  );
};

/// remix icon should be a sparkle in the top right corner and bottolm left corner with arrows circling around
export const RemixIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      version="1.1"
      id="svg4"
        width={props.width || "800px"}
        height={props.height || "800px"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M32 10        C19.5 10 10 20 10 32        C10 44 20 54 32 54        C41.5 54 50 48.5 53 40"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        id="path1"
      />

      <path
        d="m 51.054141,37.836055 3.420917,-1.672521 1.672521,3.420916"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        id="path2"
      />

      <path
        d="m 44.493165,24.745814 1.913119,-5.261077 5.261077,-1.913118 -5.261077,-1.913118 -1.913119,-5.261076 -1.913118,5.261076 -5.261076,1.913118 5.261076,1.913118 z"
        fill="currentColor"
        id="path3"
        strokeWidth="1.1957"
      />
      <path
        d="m 53.460908,30.724309 1.07613,-2.869678 2.869678,-1.076129 -2.869678,-1.076129 -1.07613,-2.869678 -1.076129,2.869678 -2.869678,1.076129 2.869678,1.076129 z"
        fill="currentColor"
        opacity="0.9"
        id="path4"
        strokeWidth="1.1957"
      />
      <path
        d="m 39.293208,30.912544 0.6756,-1.801601 1.801601,-0.6756 -1.801601,-0.6756 -0.6756,-1.801601 -0.675601,1.801601 -1.8016,0.6756 1.8016,0.6756 z"
        fill="currentColor"
        opacity="0.9"
        id="path4-9"
        strokeWidth="0.750668"
      />
    </svg>
  );
};
