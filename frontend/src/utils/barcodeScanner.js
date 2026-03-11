import Quagga from 'quagga';

export const initBarcodeScanner = (onDetected, videoElement) => {
  Quagga.init({
    inputStream: {
      name: 'Live',
      type: 'LiveStream',
      target: videoElement,
      constraints: {
        width: 640,
        height: 480,
        facingMode: 'environment'
      },
    },
    decoder: {
      readers: [
        'code_128_reader',
        'ean_reader',
        'ean_8_reader',
        'code_39_reader',
        'code_39_vin_reader',
        'codabar_reader',
        'upc_reader',
        'upc_e_reader',
        'i2of5_reader'
      ]
    },
    locate: true
  }, (err) => {
    if (err) {
      console.error('Barcode scanner initialization error:', err);
      return;
    }
    Quagga.start();
  });

  Quagga.onDetected(onDetected);
};

export const stopBarcodeScanner = () => {
  Quagga.stop();
};
