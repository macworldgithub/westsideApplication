import * as ImagePicker from 'expo-image-picker';
const requestPermissions = async () => {
  const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
  const mediaLibraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!cameraPermission.granted || !mediaLibraryPermission.granted) {
    alert('Permissions are required to access the camera and media library.');
    return false;
  }
  return true;
};
