import React from "react";

const SpinnerOne: React.FC = () => {
  return (
    <div className="flex items-center justify-center w-full h-full"> 

      <div className="flex size-12.5 items-center justify-center rounded-full border-[7px] border-stroke dark:border-strokedark">
        <div className="animate-spin">
          <svg
            width="49"
            height="50"
            viewBox="0 0 49 50"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <mask id="path-1-inside-1_1881_16179" fill="white">
              <path d="M18.5503 49.3989C23.2997 50.4597 28.2554 50.1113 32.8097 48.3965C37.364 46.6816 41.3187 43.6748 44.1889 39.7449C47.0591 35.815 48.7199 31.1328 48.9676 26.2727C49.2153 21.4125 48.0392 16.5858 45.5834 12.3844C43.1277 8.18304 39.4991 4.78974 35.1428 2.62071C30.7865 0.451685 25.8918 -0.398759 21.0592 0.173693C16.2265 0.746144 11.666 2.7166 7.93703 5.84338C4.20803 8.97015 1.47267 13.1173 0.0664691 17.7761L5.29059 19.353C6.38986 15.711 8.52815 12.4691 11.4432 10.0248C14.3582 7.58057 17.9233 6.04021 21.7011 5.59272C25.4789 5.14522 29.3052 5.81003 32.7106 7.50561C36.116 9.20119 38.9526 11.8538 40.8723 15.1381C42.792 18.4224 43.7114 22.1956 43.5178 25.9949C43.3241 29.7942 42.0258 33.4543 39.7822 36.5264C37.5385 39.5986 34.4469 41.949 30.8868 43.2896C27.3266 44.6302 23.4525 44.9025 19.7398 44.0732L18.5503 49.3989Z" />
            </mask>
            <path
              d="M18.5503 49.3989C23.2997 50.4597 28.2554 50.1113 32.8097 48.3965C37.364 46.6816 41.3187 43.6748 44.1889 39.7449C47.0591 35.815 48.7199 31.1328 48.9676 26.2727C49.2153 21.4125 48.0392 16.5858 45.5834 12.3844C43.1277 8.18304 39.4991 4.78974 35.1428 2.62071C30.7865 0.451685 25.8918 -0.398759 21.0592 0.173693C16.2265 0.746144 11.666 2.7166 7.93703 5.84338C4.20803 8.97015 1.47267 13.1173 0.0664691 17.7761L5.29059 19.353C6.38986 15.711 8.52815 12.4691 11.4432 10.0248C14.3582 7.58057 17.9233 6.04021 21.7011 5.59272C25.4789 5.14522 29.3052 5.81003 32.7106 7.50561C36.116 9.20119 38.9526 11.8538 40.8723 15.1381C42.792 18.4224 43.7114 22.1956 43.5178 25.9949C43.3241 29.7942 42.0258 33.4543 39.7822 36.5264C37.5385 39.5986 34.4469 41.949 30.8868 43.2896C27.3266 44.6302 23.4525 44.9025 19.7398 44.0732L18.5503 49.3989Z"
              stroke="#16A34A"
              strokeWidth="14"
              mask="url(#path-1-inside-1_1881_16179)"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default SpinnerOne;