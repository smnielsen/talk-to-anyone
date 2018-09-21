import React, { Component } from 'react';
import { Microphone } from 'styled-icons/fa-solid/Microphone';
import { SpeakerPhone } from 'styled-icons/material/SpeakerPhone';
import './App.css';
import styled from 'styled-components'
import languages, { getLanguageCodes } from './languages';
import translateText from './translate';

const SpeakerPhoneSmall = styled(SpeakerPhone)`
  width: 30px;
  cursor: pointer;
`

const StyledButton = styled.button`
  margin: 5px auto; 
  background: palevioletred;
  border-radius: 3px;
  padding: 40px 80px;
  width: 100%;
  font-size: 20px;
  border: none;
  color: white;
`

const Center = styled.div`
  margin-left: auto;
  margin-right: auto;
  text-align: center;
`

const Dropdown = styled.div`
  width: 100%;
  height: 30px;
  text-align: center;
`

const Label = styled.div`
  display: inline-block;
  position: relative;
  width: 120px;
  text-align: right;
  margin-right: 5px;
`

const SpeechText = styled.div`
  padding: 5px;
  font-size: 12px;
  color: grey;
  font-weight: bold;
`

const GreenResult = styled(SpeechText)`
  color: green;
  text-align: center;
  font-size: 34px;
`

const DarkGreenResult = styled(SpeechText)`
  color: darkgreen;
  display: inline-block;
`

const Subtitle = styled.div`
  color: grey;
  font-size: 10px;
  margin-top: 2px;
`

const Separator = styled.div`
  width: 300px;
  border: solid 1px black;
  margin: 10px auto;
`

const MicrophoneStyled = styled(Microphone)`
  width: 40px;
  height: auto;
`

const MicrophoneListening = styled(MicrophoneStyled)`
  color: red;
`

const Wrapper = styled.section`
  background: papayawhip;
  text-align: center;
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
`

const Container = styled.section`
  margin: 0 auto;
  padding: 10px;
  text-align: left;
`

const EmojiPointer = (props) => {
  let emoji = '';
  switch(props.emojiType) {
    case 'down':
      emoji = '👇';
      break;
    case 'right':
      emoji = '👉';
      break;
    case 'mic':
      emoji = '🎙️';
      break;
    default:
      emoji = ':'
      break;
  }
  return <span role="img" aria-label="emoji">{emoji}</span>
}

const msg = new SpeechSynthesisUtterance();
const voiceschanged = () => {
  const voices = speechSynthesis.getVoices();
  console.info(`Voices #: ${voices.length}`);
}
speechSynthesis.onvoiceschanged = voiceschanged

const findVoice = (lang) => {
  const voices = window.speechSynthesis.getVoices();
  const voice = voices.find((voice) => voice.lang === lang) || voices[10];
  console.info(`# Voice (${voice.lang}): ${voice.name}`);
  return voice;
}

const speak = (text, lang) => {
  msg.voice = findVoice(lang); // Note: some voices don't support altering params
  msg.voiceURI = 'native';
  msg.text = text;
  msg.lang = lang;
  console.log(`# Speaking (${lang}) - ${text}`);
  window.speechSynthesis.speak(msg);
}
const initialState = {
  speechText: '',
  translated: '',
  error: null,
  listening: false,
  fallbackEng: '',
  fallbackSwe: ''
};

class App extends Component {
  state = {
    ...initialState,
    translateFrom: {
      name: 'Svenska', // 'Pусский',
      code: 'sv-SE' // 'ru-RU'
    },
    translateTo: {
      name: 'Deutsch',
      code: 'de-DE'
    }
  }

  componentDidMount() {
    if (!('webkitSpeechRecognition' in window)) {
      console.error(`Not supporting speech recognition`);
      alert('Device does not support "webkitSpeechRecognition"');
      return;
    }
    console.log('translateFrom', this.state.translateFrom);
    console.log('translateTo', this.state.translateTo);

    const recognition = new window.webkitSpeechRecognition();
    recognition.interimResults = true;
    recognition.lang = this.state.translateFrom.code;

    let recognitionArray = []

    recognition.onstart = () => {
      this.setState({
        error: null
      })
    };

    recognition.onend = () => {
      recognition.stop();
      recognitionArray = [];

      setTimeout(() => {
        if (!this.state.listening) {
          return;
        }
        // Reset
        this.setState({
          listening: false,
          error: null
        });

        // Speak it!
        speak(this.state.translated, this.state.translateTo.code)
      }, 1000);
    };

    recognition.onerror = (event) => {
      console.log(`onerror: ${event}`);
      alert(`"webkitSpeechRecognition" got error: ${event.message}`, event);
      this.setState({
        listening: false,
        error: new Error(event)
      })
    }

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      if (recognitionArray.includes(transcript.toLowerCase())) {
        //console.warn(`Exists transcript: ${transcript}`);
        return;
      }
      recognitionArray.push(transcript.toLowerCase());
      //console.log(`transcript: ${transcript}`);
      this.setState({
        listening: true,
        error: null,
        speechText: transcript
      }, () => {
        const innerTranslate = (code, callback) => {
          translateText(transcript, this.state.translateFrom.code, code, (translated) => {
            callback(translated);
          });
        }

        innerTranslate(this.state.translateTo.code, (translated) => {
          this.setState({
            translated
          });
        });
        innerTranslate('en-US', (translated) => {
          this.setState({
            fallbackEng: translated
          });
        });
        innerTranslate('sv-SE', (translated) => {
          this.setState({
            fallbackSwe: translated
          });
        });
      })
    }
    this.recognition = recognition;
  }

  onClick() {
    if (this.state.listening) {
      this.recognition.stop();
      this.setState({
        listening: false
      });
      return;
    }

    this.setState({
      ...initialState,
      listening: true
    }, () => {
      this.recognition.start();
    });
  }

  onTranslateToChange(event) {
    const langName = event.target.value;
    const langCode = getLanguageCodes(langName)[0];

    this.setState({
      ...initialState,
      translateTo: {
        name: langName,
        code: langCode
      }
    }, () => {
      console.log('translateFrom', this.state.translateFrom)
      console.log('translateTo', this.state.translateTo)
    })
  }

  onTranslateFromChange(event) {
    const langName = event.target.value;
    const langCode = getLanguageCodes(langName)[0];

    this.setState({
      ...initialState,
      translateFrom: {
        name: langName,
        code: langCode
      }
    }, () => {
      this.recognition.lang = langCode;
      console.log('translateFrom', this.state.translateFrom)
      console.log('translateTo', this.state.translateTo)
    })
  }

  renderSelect(text, translateObj, onChangeHandler) {
    const options = languages.map(([langName, langCodes]) => {
       return (
        <option key={langName} value={langName}>
          {langName}
        </option>
       )
    })

    return (
      <Dropdown>
        <Label>{text}</Label>
        <select onChange={onChangeHandler} value={translateObj.name} >
          {options}
        </select>
      </Dropdown>
    )
  }
  
  render() {
    return (
      <Wrapper>
        <h1>TalkToAnyone</h1>
        <Container>
          {this.renderSelect("Translate from", this.state.translateFrom, this.onTranslateFromChange.bind(this))}
          {this.renderSelect("Translate to", this.state.translateTo, this.onTranslateToChange.bind(this))}

          <Center>
            {this.state.translateFrom.name} <EmojiPointer emojiType="mic" />
            <SpeechText>{this.state.speechText || '...'}</SpeechText>
            <StyledButton onClick={() => this.onClick()}>
              { 
                this.state.listening
                  ? <MicrophoneListening />
                  : <MicrophoneStyled />
              }
            </StyledButton>
          </Center>
          <Center>
            {this.state.translateTo.name} <EmojiPointer emojiType="down" />
            <GreenResult>{this.state.translated || '...'}</GreenResult>
            <SpeakerPhoneSmall onClick={() => speak(this.state.translated, this.state.translateTo.code)} />
          </Center>
          <Separator />
          <Center>
            English <EmojiPointer emojiType="right" /> 
            <DarkGreenResult>
            {this.state.fallbackEng || '...'}
            <SpeakerPhoneSmall onClick={() => speak(this.state.fallbackEng, 'en-US')} />
            </DarkGreenResult>
          </Center>
          <Center>
            Swedish <EmojiPointer emojiType="right" />
            <DarkGreenResult>
              {this.state.fallbackSwe || '...'}
              <SpeakerPhoneSmall onClick={() => speak(this.state.fallbackSwe, 'sv-SE')} />
            </DarkGreenResult>
          </Center>
          <Separator />
          <Center>
          <Subtitle>Powered by Yandex.Translate <a href="http://translate.yandex.com/">http://translate.yandex.com/</a></Subtitle>
          </Center>
        </Container>
      </Wrapper>
    );
  }
}

export default App;
