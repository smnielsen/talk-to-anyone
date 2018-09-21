// Imports the Google Cloud client library
import Translate from 'yandex-translate';
 
// Your Google Cloud Platform project ID
const API_KEY = 'trnsl.1.1.20180921T122306Z.830807d550981e67.84f312604e54edcb2e37302d52d56b184bc63e38';
 
// Instantiates a client
const translate = new Translate(API_KEY);

export default (text, targetCode, callback) => {
  translate.translate(text, 
    { to: targetCode.split('-')[0] }, 
    (err, res) => {
      if (err) {
        console.error('Err', err);
        console('targetCode', targetCode);
        return;
      }
      console.log(`Text: ${text}`);
      console.log(`Translation: ${res.text}`, res);
      callback(res.text)
    });
}