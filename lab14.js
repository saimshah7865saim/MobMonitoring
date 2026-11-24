      ```javascript
import React, {useState} from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';


export default function App() {

  const [screen, setScreen] = useState('home');

  const [parcels, setParcels] = useState([]);

  const addParcel = (parcel) => {
    setParcels([...parcels, parcel]);
  };


  // ---------------- HOME ----------------

  if (screen === 'home') {

    return (
      <View style={styles.home}>

        <Text style={styles.appTitle}>
          Parcel Management
        </Text>


        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => setScreen('add')}
        >
          <Text style={styles.homeButtonText}>
            Add Parcel
          </Text>
        </TouchableOpacity>


        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => setScreen('all')}
        >
          <Text style={styles.homeButtonText}>
            View All Parcels
          </Text>
        </TouchableOpacity>


        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => setScreen('track')}
        >
          <Text style={styles.homeButtonText}>
            Track Parcel
          </Text>
        </TouchableOpacity>

      </View>
    );
  }


  // ---------------- ADD PARCEL ----------------

  if (screen === 'add') {

    return (
      <AddParcel
        onBack={() => setScreen('home')}
        onAdd={addParcel}
        nextId={parcels.length + 1}
      />
    );
  }


  // ---------------- ALL PARCELS ----------------

  if (screen === 'all') {

    return (
      <AllParcels
        parcels={parcels}
        onBack={() => setScreen('home')}
      />
    );
  }


  // ---------------- TRACK PARCEL ----------------

  if (screen === 'track') {

    return (
      <TrackParcel
        parcels={parcels}
        onBack={() => setScreen('home')}
      />
    );
  }

}


// ==================================================
// ADD PARCEL
// ==================================================

function AddParcel({onBack, onAdd, nextId}) {

  const [senderName, setSenderName] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [weight, setWeight] = useState('');
  const [type, setType] = useState('');


  const handleAdd = () => {

    if (
      senderName === '' ||
      receiverName === '' ||
      weight === '' ||
      type === ''
    ) {

      Alert.alert(
        'Missing Information',
        'Please fill all fields.'
      );

      return;
    }


    const parcel = {

      id: String(nextId),

      senderName: senderName,

      receiverName: receiverName,

      weight: weight,

      type: type,

    };


    onAdd(parcel);


    Alert.alert(
      'Parcel Added',
      'Parcel ID: ' + nextId
    );


    onBack();
  };


  return (

    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >

      <Text style={styles.title}>
        Add Parcel
      </Text>


      {/* Sender */}

      <View style={styles.row}>

        <Text style={styles.label}>
          S.Name:
        </Text>

        <TextInput
          style={styles.input}
          value={senderName}
          onChangeText={setSenderName}
        />

      </View>


      {/* Receiver */}

      <View style={styles.row}>

        <Text style={styles.label}>
          R.Name:
        </Text>

        <TextInput
          style={styles.input}
          value={receiverName}
          onChangeText={setReceiverName}
        />

      </View>


      {/* Weight */}

      <View style={styles.row}>

        <Text style={styles.label}>
          Weight:
        </Text>

        <TextInput
          style={styles.input}
          value={weight}
          onChangeText={setWeight}
          keyboardType="numeric"
        />

        <Text style={styles.unit}>
          kg
        </Text>

      </View>


      {/* Type */}

      <View style={styles.row}>

        <Text style={styles.label}>
          Type:
        </Text>

        <TextInput
          style={styles.input}
          value={type}
          onChangeText={setType}
        />

      </View>


      {/* Image Box */}

      <View style={styles.uploadBox}>

        <Text style={styles.uploadText}>
          Img
        </Text>

      </View>


      <Text style={styles.uploadLabel}>
        Upload Img
      </Text>


      {/* Add */}

      <TouchableOpacity
        style={styles.addButton}
        onPress={handleAdd}
      >

        <Text style={styles.buttonText}>
          Add
        </Text>

      </TouchableOpacity>


      {/* Back */}

      <TouchableOpacity
        onPress={onBack}
        style={styles.backButton}
      >

        <Text style={styles.backText}>
          Back
        </Text>

      </TouchableOpacity>

    </ScrollView>
  );
}


// ==================================================
// ALL PARCELS
// ==================================================

function AllParcels({parcels, onBack}) {

  return (

    <View style={styles.container}>

      <Text style={styles.title}>
        All Parcels
      </Text>


      <ScrollView>

        {parcels.length === 0 ? (

          <Text style={styles.emptyText}>
            No parcels added yet.
          </Text>

        ) : (

          parcels.map((parcel) => (

            <View
              key={parcel.id}
              style={styles.parcelCard}
            >

              {/* Image */}

              <View style={styles.parcelImage}>

                <Text style={styles.uploadText}>
                  Img
                </Text>

              </View>


              {/* Details */}

              <View style={styles.details}>

                <Text>
                  ID: {parcel.id}
                </Text>

                <Text>
                  From: {parcel.senderName}
                </Text>

                <Text>
                  To: {parcel.receiverName}
                </Text>

                <Text>
                  Weight: {parcel.weight} kg
                </Text>

                <Text>
                  Type: {parcel.type}
                </Text>

              </View>

            </View>

          ))

        )}

      </ScrollView>


      {/* Back */}

      <TouchableOpacity
        onPress={onBack}
        style={styles.bottomBack}
      >

        <Text style={styles.backText}>
          Back
        </Text>

      </TouchableOpacity>

    </View>
  );
}


// ==================================================
// TRACK PARCEL
// ==================================================

function TrackParcel({parcels, onBack}) {

  const [parcelId, setParcelId] = useState('');

  const [parcel, setParcel] = useState(null);


  const searchParcel = () => {

    const found = parcels.find(
      (item) => item.id === parcelId
    );


    if (found) {

      setParcel(found);

    } else {

      setParcel(null);

      Alert.alert(
        'Parcel Not Found',
        'No parcel exists with this ID.'
      );
    }
  };


  return (

    <View style={styles.container}>

      <Text style={styles.title}>
        Track Parcel
      </Text>


      {/* Search Row */}

      <View style={styles.trackRow}>

        <Text style={styles.trackLabel}>
          Parcel ID:
        </Text>


        <TextInput
          style={styles.trackInput}
          value={parcelId}
          onChangeText={setParcelId}
          keyboardType="numeric"
        />


        <TouchableOpacity
          style={styles.searchButton}
          onPress={searchParcel}
        >

          <Text style={styles.searchText}>
            Search
          </Text>

        </TouchableOpacity>

      </View>


      {/* Result */}

      {parcel && (

        <View style={styles.trackCard}>

          <View style={styles.trackImage}>

            <Text style={styles.uploadText}>
              Img
            </Text>

          </View>


          <Text style={styles.detailText}>
            ID: {parcel.id}
          </Text>

          <Text style={styles.detailText}>
            From: {parcel.senderName}
          </Text>

          <Text style={styles.detailText}>
            To: {parcel.receiverName}
          </Text>

          <Text style={styles.detailText}>
            Weight: {parcel.weight} kg
          </Text>

          <Text style={styles.detailText}>
            Type: {parcel.type}
          </Text>

        </View>

      )}


      {/* Back */}

      <TouchableOpacity
        onPress={onBack}
        style={styles.bottomBack}
      >

        <Text style={styles.backText}>
          Back
        </Text>

      </TouchableOpacity>

    </View>
  );
}


// ==================================================
// STYLES
// ==================================================

const styles = StyleSheet.create({

  // HOME

  home: {
    flex: 1,
    justifyContent: 'center',
    padding: 30,
    backgroundColor: '#FFFFFF',
  },

  appTitle: {
    fontSize: 25,
    textAlign: 'center',
    marginBottom: 40,
    fontWeight: 'bold',
  },

  homeButton: {
    borderWidth: 1,
    borderColor: '#333333',
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
  },

  homeButtonText: {
    fontSize: 18,
  },


  // GENERAL

  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },

  content: {
    paddingBottom: 30,
  },

  title: {
    fontSize: 24,
    textAlign: 'center',
    marginTop: 25,
    marginBottom: 35,
    fontWeight: 'bold',
  },


  // ADD PARCEL

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  label: {
    width: 80,
    fontSize: 16,
  },

  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#333333',
    paddingHorizontal: 8,
  },

  unit: {
    marginLeft: 5,
    fontSize: 16,
  },

  uploadBox: {
    height: 120,
    borderWidth: 1,
    borderColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },

  uploadText: {
    fontSize: 16,
    color: '#555555',
  },

  uploadLabel: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 16,
  },

  addButton: {
    borderWidth: 1,
    borderColor: '#333333',
    alignSelf: 'center',
    width: 100,
    padding: 10,
    alignItems: 'center',
    marginTop: 25,
  },

  buttonText: {
    fontSize: 16,
  },

  backButton: {
    alignSelf: 'center',
    marginTop: 25,
  },

  backText: {
    color: 'blue',
    fontSize: 16,
  },


  // ALL PARCELS

  parcelCard: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#333333',
    padding: 10,
    marginBottom: 15,
  },

  parcelImage: {
    width: 90,
    height: 90,
    borderWidth: 1,
    borderColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
  },

  details: {
    marginLeft: 15,
    justifyContent: 'center',
  },

  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },

  bottomBack: {
    alignSelf: 'center',
    marginTop: 15,
    marginBottom: 15,
  },


  // TRACK

  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  trackLabel: {
    fontSize: 16,
    marginRight: 8,
  },

  trackInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#333333',
    paddingHorizontal: 8,
  },

  searchButton: {
    borderWidth: 1,
    borderColor: '#333333',
    padding: 10,
    marginLeft: 8,
  },

  searchText: {
    fontSize: 14,
  },

  trackCard: {
    borderWidth: 1,
    borderColor: '#333333',
    padding: 15,
    marginTop: 25,
  },

  trackImage: {
    width: '100%',
    height: 150,
    borderWidth: 1,
    borderColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },

  detailText: {
    fontSize: 16,
    marginBottom: 8,
  },

});
```