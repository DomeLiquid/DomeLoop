'use client';

export type IconProps = {
  size?: number;
  className?: string;
};

export const IconInfiniteLoader = ({ size = 24, className }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 300 150"
    width={size}
    height={size}
    className={className}
  >
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="20"
      strokeLinecap="round"
      strokeDasharray="300 385"
      strokeDashoffset="0"
      d="M275 75c0 31-27 50-50 50-58 0-92-100-150-100-28 0-50 22-50 50s23 50 50 50c58 0 92-100 150-100 24 0 50 19 50 50Z"
    >
      <animate
        attributeName="stroke-dashoffset"
        calcMode="spline"
        dur="2"
        values="685;-685"
        keySplines="0 0 1 1"
        repeatCount="indefinite"
      ></animate>
    </path>
  </svg>
);

export const IconDomeLoop = ({ size = 24, className }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    width={size}
    height={size}
    viewBox="0 0 512 512"
    fill="none"
    id="iconWithBackground"
  >
    <rect
      id="r4"
      width="512"
      height="512"
      x="0"
      y="0"
      rx="256"
      fill="url(#linearGradient-iconWithBackground)"
      stroke="#000000"
      stroke-width="0"
      stroke-opacity="55%"
      paint-order="stroke"
    />
    <rect
      width="512"
      height="512"
      x="0"
      y="0"
      fill="url(#glare)"
      rx="256"
      style={{ mixBlendMode: 'overlay', transformOrigin: 'center center' }}
    />
    <defs>
      <linearGradient
        id="linearGradient-iconWithBackground"
        gradientUnits="userSpaceOnUse"
        gradientTransform="rotate(85)"
      >
        <stop stop-color="#00a38d" />
        <stop offset="1" stop-color="#ff2e2e" />
      </linearGradient>
      <radialGradient
        id="glare"
        cx="0"
        cy="0"
        r="1"
        gradientUnits="userSpaceOnUse"
        gradientTransform="translate(256) rotate(90) scale(512)"
      >
        <stop stop-color="white" />
        <stop offset="1" stop-color="white" stop-opacity="0" />
      </radialGradient>
      <clipPath id="clip">
        <use xlinkHref="#r4" />
      </clipPath>
    </defs>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="352"
      height="352"
      viewBox="0 0 36 36"
      x="80"
      y="80"
    >
      <path
        fill="#ffffff"
        d="M18 32.625c-5.09 0-10.5-3.965-10.5-11.312c0-4.877 3.365-9.178 7.591-12.272C12.393 7.739 9.756 7 8 7c-2.708 0-5.499.914-5.527.923a1.5 1.5 0 0 1-.947-2.846C1.658 5.033 4.793 4 8 4c2.695 0 6.449 1.158 10.01 3.162C21.565 5.158 25.31 4 28 4c3.207 0 6.222 1.559 6.344 1.625c.781.422 1.312.699 1.125 1.266c-.182.551-.891.328-1.75.234c-.029-.003-2.156-.391-5.688-.391c-1.752 0-4.41 1.003-7.1 2.304c4.215 3.083 7.568 7.36 7.568 12.212C28.5 28.639 23.09 32.625 18 32.625zm.013-21.954c-4.03 2.585-7.513 6.345-7.513 10.642c0 6.056 4.6 8.312 7.5 8.312c2.899 0 7.5-2.273 7.5-8.375c0-4.27-3.468-8.005-7.487-10.579z"
      />
    </svg>
  </svg>
);

export const IconDome = ({ size = 24, className }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    // width="true"
    // height="true"
    viewBox="0 0 512 512"
    fill="none"
    className="h-full w-full"
    id="iconWithBackground"
    width={size}
    height={size}
  >
    <rect
      id="r4"
      width="512"
      height="512"
      x="0"
      y="0"
      rx="256"
      fill="url(#linearGradient-iconWithBackground)"
      stroke="#000000"
      stroke-width="0"
      stroke-opacity="45%"
      paint-order="stroke"
    />
    <rect
      width="512"
      height="512"
      x="0"
      y="0"
      fill="url(#glare)"
      rx="256"
      fillOpacity={0.2}
      style={{ mixBlendMode: 'overlay' }}
    />
    <defs>
      <linearGradient
        id="linearGradient-iconWithBackground"
        gradientUnits="userSpaceOnUse"
        gradientTransform="rotate(86)"
        style={{ transformOrigin: 'center center' }}
      >
        <stop stop-color="#009985" />
        <stop offset="1" stop-color="#000000" />
      </linearGradient>
      <radialGradient
        id="glare"
        cx="0"
        cy="0"
        r="1"
        gradientUnits="userSpaceOnUse"
        gradientTransform="translate(256) rotate(90) scale(512)"
      >
        <stop stop-color="white" />
        <stop offset="1" stop-color="white" stop-opacity="0" />
      </radialGradient>
      <clipPath id="clip">
        <use xlinkHref="#r4" />
      </clipPath>
    </defs>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="394"
      height="394"
      viewBox="0 0 36 36"
      x="59"
      y="59"
    >
      <path
        fill="#ffffff"
        d="M18 32.625c-5.09 0-10.5-3.965-10.5-11.312c0-4.877 3.365-9.178 7.591-12.272C12.393 7.739 9.756 7 8 7c-2.708 0-5.499.914-5.527.923a1.5 1.5 0 0 1-.947-2.846C1.658 5.033 4.793 4 8 4c2.695 0 6.449 1.158 10.01 3.162C21.565 5.158 25.31 4 28 4c3.207 0 6.222 1.559 6.344 1.625c.781.422 1.312.699 1.125 1.266c-.182.551-.891.328-1.75.234c-.029-.003-2.156-.391-5.688-.391c-1.752 0-4.41 1.003-7.1 2.304c4.215 3.083 7.568 7.36 7.568 12.212C28.5 28.639 23.09 32.625 18 32.625zm.013-21.954c-4.03 2.585-7.513 6.345-7.513 10.642c0 6.056 4.6 8.312 7.5 8.312c2.899 0 7.5-2.273 7.5-8.375c0-4.27-3.468-8.005-7.487-10.579z"
      />
    </svg>
  </svg>
);

export const IconMixin = ({ size = 24, className }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      fill="#1A73E8"
      d="m26.405 7.151l-3.63 1.61a.67.67 0 0 0-.35.59v12.98a.66.66 0 0 0 .36.59l3.63 1.57a.338.338 0 0 0 .5-.3V7.451a.35.35 0 0 0-.51-.3M9.02 8.741l-3.52-1.6a.338.338 0 0 0-.5.3v16.74a.341.341 0 0 0 .52.29l3.54-1.87a.67.67 0 0 0 .32-.57v-12.7a.7.7 0 0 0-.36-.59m11.04 4.43l-3.79-2.17a.67.67 0 0 0-.67 0l-3.86 2.15a.68.68 0 0 0-.34.59v4.4c0 .243.13.468.34.59l3.86 2.22c.207.12.463.12.67 0l3.79-2.2a.68.68 0 0 0 .34-.59v-4.4a.67.67 0 0 0-.34-.59"
    />
  </svg>
);

export const IconPando = ({ size = 24, className }: IconProps) => (
  <svg
    width="30"
    height="30"
    viewBox="0 0 30 30"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M0 15C0 6.71573 6.71573 0 15 0C23.2843 0 30 6.71573 30 15C30 23.2843 23.2843 30 15 30C6.71573 30 0 23.2843 0 15Z"
      fill="black"
    />
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M11.5037 8.36548C11.2397 8.36548 11.0126 8.55206 10.9614 8.81097L9.6552 15.4126C10.7043 14.4324 12.109 13.8433 13.6289 13.8413L14.0429 11.7715H16.4074C17.2756 11.7715 17.9795 12.4753 17.9795 13.3435C17.9795 14.2117 17.2756 14.9155 16.4074 14.9155H13.68L13.6787 15.0624C11.4593 15.0425 9.54071 16.6067 9.11322 18.7846L8.80248 20.3677L8.67956 20.3435L8.50571 21.2222C8.46345 21.4358 8.6269 21.6347 8.84463 21.6347H11.6473C11.91 21.6347 12.1364 21.4498 12.1889 21.1925L12.2226 21.0275C12.5377 19.4832 13.8961 18.3739 15.4723 18.3739H16.5321C19.296 18.3739 21.5366 16.1335 21.5366 13.3697C21.5366 10.6059 19.296 8.36548 16.5321 8.36548H11.5037Z"
      fill="white"
    />
  </svg>
);
