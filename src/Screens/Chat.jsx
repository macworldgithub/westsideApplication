// /screens/Chat.js
import React, { useState } from "react";
import {
  SafeAreaView,
  FlatList,
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";

const initialMessages = [
  { id: "1", text: "Hello!", sender: "other" },
  { id: "2", text: "Hi, how can I help you today?", sender: "me" },
];

export default function Chat() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMsg = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: "me",
    };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");
  };

  const renderItem = ({ item }) => (
    <View
      className={`max-w-3/4 p-2 my-1 rounded-lg ${
        item.sender === "me" ? "bg-blue-500 self-end" : "bg-gray-200 self-start"
      }`}
    >
      <Text className={`${item.sender === "me" ? "text-white" : "text-black"}`}>
        {item.text}
      </Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 12 }}
      />

      <View className="flex-row items-center p-2 border-t border-gray-200 mb-44">
        <TextInput
          className="flex-1 border rounded-full px-4 py-2 mr-2 bg-gray-100"
          placeholder="Type a message"
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity
          onPress={sendMessage}
          className="bg-blue-500 p-3 rounded-full"
        >
          <Text className="text-white font-medium">Send</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
