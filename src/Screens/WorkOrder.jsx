import React from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native'; // ✅ Import navigation hook

const orders = [
    { id: '0124568', owner: 'Paul', mechanic: 'Walker', status: 'Inprogress' },
    { id: '0124569', owner: 'Sara', mechanic: 'Davis', status: 'Completed' },
    { id: '0124570', owner: 'John', mechanic: 'Lee', status: 'Assessment' },
    { id: '0124571', owner: 'Mike', mechanic: 'Taylor', status: 'Inprogress' }

];

const getStatusColor = (status) => {
    switch (status) {
        case 'Inprogress': return 'bg-green-300';
        case 'Completed': return 'bg-green-500';
        case 'Assessment': return 'bg-red-300';
        default: return 'bg-gray-300';
    }
};

export default function WorkOrdersScreen() {
    const navigation = useNavigation();

    return (
        <View className="flex-1 bg-black px-4 pt-16">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center space-x-2">
                    {/* ✅ Wrapped Image in TouchableOpacity */}
                    <TouchableOpacity onPress={() => navigation.navigate('RegisteredCars')}>
                        <Image source={require('../../assets/back.png')} className="w-6 h-6" />
                    </TouchableOpacity>
                    <Text className="text-white text-lg font-semibold ml-4">Work Orders</Text>
                </View>


                <TouchableOpacity
                    className="bg-gray-200 px-4 py-1 rounded-md"
                    onPress={() => navigation.navigate('NewWorkOrder')}
                >
                    <Text className="text-black text-sm">+ New Order</Text>
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View className="bg-white rounded-md flex-row items-center px-3 py-2 mb-9">
                <Ionicons name="search" size={20} color="gray" />
                <TextInput
                    placeholder="Search order Id or name"
                    placeholderTextColor="gray"
                    className="ml-2 flex-1 text-black"
                />
            </View>

            {/* Order Cards */}
            <ScrollView showsVerticalScrollIndicator={false}>
                {orders.map((order, index) => (

                    <TouchableOpacity
                        key={index}
                        onPress={() => navigation.navigate('ViewServices')}
                        className="flex-row items-center bg-white p-3 rounded-xl mb-4"
                    >
                        {/* Image */}
                        <View className="w-12 h-12 mr-3 bg-gray-200 rounded-xl items-center justify-center overflow-hidden">
                            <Image
                                source={require('../../assets/clipboard.png')}
                                className="w-full h-full resize-contain"
                            />
                        </View>

                        {/* Order Info */}
                        <View className="flex-1">
                            <Text className="text-black font-semibold">Order No: {order.id}</Text>
                            <Text className="text-black text-sm">Owner Name: {order.owner}</Text>
                            <Text className="text-black text-sm">Head Mechanic: {order.mechanic}</Text>
                        </View>

                        {/* Buttons Section */}
                        <View className="items-center space-y-1.5 ">
                            <Text className="text-black text-xs mb-1 ">Status</Text>
                            <TouchableOpacity
                                className={`rounded-full mb-1 items-center justify-center ${getStatusColor(order.status)}`}
                                style={{ width: 80, height: 20 }}
                            >
                                <Text className="text-xs text-black">{order.status}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="bg-black rounded-full mb-1 items-center justify-center"
                                style={{ width: 80, height: 20 }}
                                onPress={() => navigation.navigate('ReportScreen')} // Navigate to ReportScreen
                            >
                                <Text className="text-white text-xs">Report</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="bg-black rounded-full items-center justify-center"
                                style={{ width: 80, height: 20 }}
                                onPress={() => navigation.navigate('CarOrderDetails')}
                            >
                                <Text className="text-white text-xs">View</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}
