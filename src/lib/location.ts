type Position = {
  latitude: number;
  longitude: number;
};

export type LocationError = {
  code: number;
  message: string;
};

export const getLocation = (): Promise<Position> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({
        code: 0,
        message: "Geolocation is not supported by your browser",
      });
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject({
            code: error.code,
            message: error.message,
          });
        }
      );
    }
  });
};