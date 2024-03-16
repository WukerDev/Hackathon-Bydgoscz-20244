import React, { useState, useEffect } from 'react';
import { View, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';


import { CustomDarkTheme, CustomLightTheme } from './Theme';
import { useColorScheme } from 'react-native';
import { color } from '@rneui/base';

import { Composer } from 'react-native-gifted-chat';

const CHAT_HISTORY_KEY = '@chat_history';

const Chat: React.FC = () => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? CustomDarkTheme : CustomLightTheme;
  const [messages, setMessages] = useState<IMessage[]>([]);

  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(CHAT_HISTORY_KEY);
      const history = jsonValue != null ? JSON.parse(jsonValue) : [];
      setMessages(history);
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const storeChatHistory = async (newMessages: IMessage[]) => {
    try {
      const jsonValue = JSON.stringify(newMessages);
      await AsyncStorage.setItem(CHAT_HISTORY_KEY, jsonValue);
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  };

  const clearChatHistory = async () => {
    try {
      await AsyncStorage.removeItem(CHAT_HISTORY_KEY);
      setMessages([]);
    } catch (error) {
      console.error('Error clearing chat history:', error);
    }
  };

  const onSend = async (newMessages: IMessage[] = []) => {
    setMessages((previousMessages) => GiftedChat.append(previousMessages, newMessages));

    const chatHistory = messages.concat(newMessages).map((msg) => ({
      role: msg.user._id === 1 ? 'user' : 'assistant',
      content: msg.text,
    }));

    try {
      const response = await fetch('http://10.13.45.163:5000/sendToGPT', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chatHistory),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reply = await response.json();

      const messageParts = reply.content.split('. '); // Split the message by sentences for example
      let totalDelay = 0;

      messageParts.forEach((part: string | any[], index: number) => {
        // Assuming a typing delay of 100ms per character, as an example
        const delay = index === 0 ? 0 : part.length * 100;
        totalDelay += delay;
        setTimeout(() => {
          const receivedMessage: IMessage = {
            _id: Math.round(Math.random() * 1000000),
            text: part,
            createdAt: new Date(),
            user: {
              _id: 2,
              name: 'assistant',
            },
          };

          setMessages((previousMessages) => {
            const updatedMessages = GiftedChat.append(previousMessages, [receivedMessage]);
            storeChatHistory(updatedMessages);
            return updatedMessages;
          });

          
          
        }, totalDelay); // Use the calculated delay
      });
    } catch (error) {
      console.error('Error sending chat message:', error);
    }
  };

  const renderComposer = (props: any) => (
    <Composer
      {...props}
      textInputStyle={{
        color: theme.colors.background,
      }}
    />
  );


  return (
    <View style={{ flex: 1 }}>
      <View style={styles.newChatButton}>
        <Button title="New Chat" onPress={clearChatHistory} />
      </View>
      <GiftedChat
        messages={messages}
        isTyping={true} // Show the typing indicator
        onSend={(messagesToSend: IMessage[]) => onSend(messagesToSend)}
        user={{ _id: 1 }}
        renderFooter={() => null} // Typing indicator managed via isTyping prop
        renderComposer={renderComposer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  newChatButton: {
    padding: 10,
    paddingTop: 30, // Adjust as necessary for your app's layout
  },
  // ... other styles you may have ...
});

export default Chat;
