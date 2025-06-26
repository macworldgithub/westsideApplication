import Toast from 'react-native-toast-message';

// Centralized toast utility function
const showToast = ({ type = 'success', title = '', message = '' }) => {
  Toast.show({
    type,
    text1: title,
    text2: message,
    
  });
};

export default showToast;