import React, { Component } from 'react';
import { Microphone } from 'styled-icons/fa-solid/Microphone';

import './App.css';
import styled from 'styled-components'
import languages, { getLanguageCodes } from './languages';
import translateText from './translate';

const StyledButton = styled.button`
  margin: 20px auto; 
  background: palevioletred;
  border-radius: 3px;
  padding: 40px 80px;
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
  margin: 5px;
  font-size: 16px;
  color: black;
`

const GreenResult = styled(SpeechText)`
  color: green;
  font-weight: bold;
  text-align: center;
  font-size: 34px;
`

const GreyResult = styled(SpeechText)`
  color: grey;
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
  padding: 4em;
  background: papayawhip;
  text-align: center;
`

const Container = styled.section`
  width: 500px;
  margin: 0 auto;
  padding: 10px;
  text-align: left;
`

const EmojiPointer = (props) => {
  let emoji = '';
  switch(props.direction) {
    case 'down':
      emoji = '👇';
      break;
    case 'right':
      emoji = '👉';
      break;
    default:
      emoji = ':'
      break;
  }
  return <span role="img" aria-label="emoji">{emoji}</span>
}

const msg = new SpeechSynthesisUtterance();
const voices = window.speechSynthesis.getVoices();
const speak = (text, lang) => {
  msg.voice = voices[10]; // Note: some voices don't support altering params
  msg.voiceURI = 'native';
  msg.text = text;
  msg.lang = lang;
  window.speechSynthesis.speak(msg);
}

class App extends Component {
  state = {
    speechText: '',
    translated: '',
    fallback: '',
    error: null,
    listening: false,
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
      return;
    }
    console.log('translateFrom', this.state.translateFrom);
    console.log('translateTo', this.state.translateTo);

    voices.forEach((voice) => {
      console.log(voice.name, voice.default ? voice.default :'');
    });

    const recognition = new window.webkitSpeechRecognition();
    recognition.interimResults = true;
    recognition.lang = this.state.translateFrom.code;

    let recognitionArray = []

    recognition.onstart = () => {
      console.log('onStart');
      this.setState({
        listening: true,
        error: null
      })
    };
    recognition.onend = () => {
      console.log('onend');
      recognition.stop();
      recognitionArray = [];

      setTimeout(() => {
        if (!this.state.listening) {
          return;
        }
        // Talk
        speak(this.state.translated, this.state.translateTo.code)

        // Reset
        this.setState({
          listening: false,
          error: null
        });
      }, 1000);
    };

    recognition.onerror = (event) => {
      console.log(`onerror: ${event}`);
      this.setState({
        listening: false,
        error: new Error(event)
      })
    }

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      if (recognitionArray.includes(transcript.toLowerCase())) {
        console.warn(`Exists transcript: ${transcript}`);
        return;
      }
      recognitionArray.push(transcript.toLowerCase());
      console.log(`transcript: ${transcript}`);
      this.setState({
        listening: true,
        error: null,
        speechText: transcript
      }, () => {
        translateText(this.state.speechText, this.state.translateTo.code, (translated) => {
          this.setState({
            translated
          });

          translateText(this.state.speechText, 'en', (translated) => {
            this.setState({
              fallbackEng: translated
            });

            translateText(this.state.speechText, 'sv', (translated) => {
              this.setState({
                fallbackSwe: translated
              });
            })
          })
        })
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
      listening: true
    });
    this.recognition.start();
  }

  onTranslateToChange(event) {
    const langName = event.target.value;
    const langCode = getLanguageCodes(langName)[0];

    this.setState({
      translateTo: {
        name: langName,
        code: langCode
      }
    }, () => {
      console.log('translateTo', this.state.translateTo)
    })
  }

  onTranslateFromChange(event) {
    const langName = event.target.value;
    const langCode = getLanguageCodes(langName)[0];

    this.setState({
      translateFrom: {
        name: langName,
        code: langCode
      }
    }, () => {
      this.recognition.lang = langCode;
      console.log('translateFrom', this.state.translateFrom)
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
        <Subtitle>Talk and it will do the rest for you...</Subtitle>
        <Container>
          {this.renderSelect("Translate from", this.state.translateFrom, this.onTranslateFromChange.bind(this))}
          {this.renderSelect("Translate to", this.state.translateTo, this.onTranslateToChange.bind(this))}

          <Center>
            {this.state.translateFrom.name} <EmojiPointer direction="down" />
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
            {this.state.translateTo.name} <EmojiPointer direction="down" />
            <GreenResult>{this.state.translated || '...'}</GreenResult>
          </Center>
          <Separator />
          <Center>
            English <EmojiPointer direction="down" />
            <GreyResult>{this.state.fallbackEng || '...'}</GreyResult>
          </Center>
          <Center>
            Swedish <EmojiPointer direction="down" />
            <GreyResult>{this.state.fallbackSwe || '...'}</GreyResult>
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
