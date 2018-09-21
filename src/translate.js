// Imports the Google Cloud client library
import Translate from 'yandex-translate';
 
// Your Google Cloud Platform project ID
const API_KEY = 'trnsl.1.1.20180921T122306Z.830807d550981e67.84f312604e54edcb2e37302d52d56b184bc63e38';
 
// Instantiates a client
const translate = new Translate(API_KEY);

export default (text, translateFrom, translateTo, callback) => {
  translate.translate(text, 
    { 
      from: translateFrom.split('-')[0],
      to: translateTo.split('-')[0]
    },
    (err, res) => {
      if (err) {
        console.log(`Text: ${text}`);
        console.log(`Translation: ${res.text}`, res);
        console.log('translateTo', translateTo);
        console.error('Err', err);
        return;
      }
      callback(res.text)
    });
}