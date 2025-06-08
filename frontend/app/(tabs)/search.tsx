import { StyleSheet, View, Text, TextInput, TouchableWithoutFeedback, Keyboard } from 'react-native';

export default function SearchScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.appTitle}>pAIper</Text>
      <TextInput style={styles.searchBar} placeholder='Search for paper'/>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{flex: 1}}>
            <Text style={{ color: '#fff', marginTop: 20 }}>
              Continue where you left off...
            </Text>
          </View>
      </TouchableWithoutFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 72,
    paddingHorizontal: 32
  },
  appTitle: {
    color: '#fff',
    fontSize: 38,
    fontWeight: 'bold',
    width: '100%'
  },
  searchBar: {
    color: '#fff',
    height: 48,
    borderColor: '#fff',
    borderWidth: 1,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 24,
  }
});
