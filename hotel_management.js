import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';

// prices per night
const SINGLE_PRICE = 5000;
const DOUBLE_PRICE = 8000;
const SUITE_PRICE = 15000;

const EXTRA_BED_PRICE = 1500; // per bed per night (double and suite only)
const MEAL_PRICE = 800; // per meal
const TAX = 10; // percent

// give the price of a room type
function getPrice(type) {
  if (type === 'Single') {
    return SINGLE_PRICE;
  } else if (type === 'Double') {
    return DOUBLE_PRICE;
  } else {
    return SUITE_PRICE;
  }
}

// calculate the bill of one guest
function calculateBill(roomPrice, type, nights, extraBeds, mealsPerDay) {
  const roomCharge = roomPrice * nights;

  let bedCharge = 0;
  if (type !== 'Single') {
    bedCharge = extraBeds * EXTRA_BED_PRICE * nights;
  }

  const mealCharge = mealsPerDay * MEAL_PRICE * nights;

  const subTotal = roomCharge + bedCharge + mealCharge;
  const tax = (subTotal * TAX) / 100;
  const total = subTotal + tax;

  return {roomCharge, bedCharge, mealCharge, tax, total};
}

export default function App() {
  // which screen is open: home, rooms, add, checkin
  const [screen, setScreen] = useState('home');

  // all rooms
  const [rooms, setRooms] = useState([
    {number: '101', type: 'Single', price: 5000, guest: ''},
    {number: '102', type: 'Single', price: 5000, guest: ''},
    {number: '201', type: 'Double', price: 8000, guest: ''},
    {number: '202', type: 'Double', price: 8000, guest: ''},
    {number: '301', type: 'Suite', price: 15000, guest: ''},
  ]);

  const [earning, setEarning] = useState(0);

  // saved check-in list (this keeps the data of every guest we add)
  const [savedList, setSavedList] = useState([]);

  // customers list (keeps customer details)
  const [customers, setCustomers] = useState([]);
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [nextCustomerId, setNextCustomerId] = useState(1); // for ids like C1, C2
  const [searchText, setSearchText] = useState('');

  // add room screen
  const [newNumber, setNewNumber] = useState('');
  const [newType, setNewType] = useState('Single');
  const [newPrice, setNewPrice] = useState('5000');

  // check in screen
  const [selectedRoom, setSelectedRoom] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestAddress, setGuestAddress] = useState('');
  const [billResult, setBillResult] = useState(null); // filled when Calculate is pressed
  const [nights, setNights] = useState('1');
  const [extraBeds, setExtraBeds] = useState('0');
  const [meals, setMeals] = useState('0');

  // count rooms
  const totalRooms = rooms.length;
  const singleRooms = rooms.filter(r => r.type === 'Single').length;
  const doubleRooms = rooms.filter(r => r.type === 'Double').length;
  const suiteRooms = rooms.filter(r => r.type === 'Suite').length;
  const bookedRooms = rooms.filter(r => r.guest !== '').length;
  const emptyRooms = totalRooms - bookedRooms;

  // customers shown on the customers screen (search by id or name)
  const shownCustomers = customers.filter(c => {
    const text = searchText.toLowerCase();
    return c.id.toLowerCase().includes(text) || c.name.toLowerCase().includes(text);
  });

  // total bill of all guests added in check in
  let allGuestsTotal = 0;
  for (let i = 0; i < savedList.length; i++) {
    allGuestsTotal = allGuestsTotal + savedList[i].total;
  }

  // when type button is pressed on add room screen
  function chooseType(type) {
    setNewType(type);
    setNewPrice(String(getPrice(type)));
  }

  // add a new room
  function addRoom() {
    if (newNumber === '') {
      Alert.alert('Error', 'Please enter room number');
      return;
    }

    // check if room number already there
    for (let i = 0; i < rooms.length; i++) {
      if (rooms[i].number === newNumber) {
        Alert.alert('Error', 'This room number already exists');
        return;
      }
    }

    const room = {
      number: newNumber,
      type: newType,
      price: Number(newPrice),
      guest: '',
    };

    setRooms([...rooms, room]);
    setNewNumber('');
    Alert.alert('Done', 'Room added');
  }

  // save a customer
  function addCustomer() {
    if (custName === '') {
      Alert.alert('Error', 'Please enter customer name');
      return;
    }
    if (custPhone === '') {
      Alert.alert('Error', 'Please enter phone number');
      return;
    }

    const customer = {
      id: 'C' + nextCustomerId,
      name: custName,
      phone: custPhone,
      address: custAddress,
      bookings: [], // the bills of this customer are saved here
    };

    setCustomers([...customers, customer]);
    setNextCustomerId(nextCustomerId + 1);
    setCustName('');
    setCustPhone('');
    setCustAddress('');
    Alert.alert('Saved', 'Customer details saved. ID: ' + customer.id);
  }

  // delete a customer
  function deleteCustomer(id) {
    const newList = customers.filter(c => c.id !== id);
    setCustomers(newList);
  }

  // save the customer details and the bill in the customers list
  // it gives back the customer id
  function saveCustomerWithBooking(booking) {
    let found = false;
    let customerId = '';

    const newList = customers.map(c => {
      if (c.name.toLowerCase() === guestName.toLowerCase()) {
        found = true;
        customerId = c.id;
        // remove the old calculated bill (not added yet) and put the new one
        const oldBookings = c.bookings.filter(b => b.status !== 'Calculated');
        return {
          ...c,
          phone: guestPhone !== '' ? guestPhone : c.phone,
          address: guestAddress !== '' ? guestAddress : c.address,
          bookings: [...oldBookings, booking],
        };
      }
      return c;
    });

    // if this customer is new, add him with a new id
    if (found === false) {
      customerId = 'C' + nextCustomerId;
      newList.push({
        id: customerId,
        name: guestName,
        phone: guestPhone,
        address: guestAddress,
        bookings: [booking],
      });
      setNextCustomerId(nextCustomerId + 1);
    }

    setCustomers(newList);
    return customerId;
  }

  // calculate the bill when Calculate button is pressed
  function calculateNow() {
    if (selectedRoom === '') {
      Alert.alert('Error', 'Please select a room');
      return;
    }
    if (guestName === '') {
      Alert.alert('Error', 'Please enter customer name');
      return;
    }
    if (isNaN(Number(nights)) || Number(nights) < 1) {
      Alert.alert('Error', 'Nights must be 1 or more');
      return;
    }

    const room = rooms.find(r => r.number === selectedRoom);

    // room must be free
    if (room.guest !== '') {
      Alert.alert(
        'Room not available',
        'Room ' + room.number + ' is already booked by ' + room.guest + '. Please choose another room.',
      );
      return;
    }

    const bill = calculateBill(
      room.price,
      room.type,
      Number(nights),
      Number(extraBeds),
      Number(meals),
    );

    // save the customer and his bill in the customers list right now
    const calcBooking = {
      number: room.number,
      nights: Number(nights),
      total: bill.total,
      status: 'Calculated',
    };
    const customerId = saveCustomerWithBooking(calcBooking);

    // show customer details and bill
    setBillResult({
      customerId: customerId,
      name: guestName,
      phone: guestPhone,
      address: guestAddress,
      roomNumber: room.number,
      roomType: room.type,
      nights: Number(nights),
      roomCharge: bill.roomCharge,
      bedCharge: bill.bedCharge,
      mealCharge: bill.mealCharge,
      tax: bill.tax,
      total: bill.total,
    });
  }

  // check in a guest
  function checkIn() {
    if (selectedRoom === '') {
      Alert.alert('Error', 'Please select a room');
      return;
    }
    if (guestName === '') {
      Alert.alert('Error', 'Please enter guest name');
      return;
    }

    if (isNaN(Number(nights)) || Number(nights) < 1) {
      Alert.alert('Error', 'Nights must be 1 or more');
      return;
    }

    // room must be free
    const roomToCheck = rooms.find(r => r.number === selectedRoom);
    if (roomToCheck.guest !== '') {
      Alert.alert(
        'Room not available',
        'Room ' + roomToCheck.number + ' is already booked by ' + roomToCheck.guest + '. Please choose another room.',
      );
      return;
    }

    const newRooms = rooms.map(r => {
      if (r.number === selectedRoom) {
        return {
          ...r,
          guest: guestName,
          nights: Number(nights),
          extraBeds: Number(extraBeds),
          meals: Number(meals),
        };
      }
      return r;
    });

    setRooms(newRooms);

    // save this guest in the saved list
    const room = rooms.find(r => r.number === selectedRoom);
    const bill = calculateBill(
      room.price,
      room.type,
      Number(nights),
      Number(extraBeds),
      Number(meals),
    );
    const saved = {
      number: room.number,
      type: room.type,
      guest: guestName,
      phone: guestPhone,
      address: guestAddress,
      nights: Number(nights),
      total: bill.total,
      status: 'Staying',
    };
    setSavedList([...savedList, saved]);

    // save the bill in the customer details
    const booking = {
      number: room.number,
      nights: Number(nights),
      total: bill.total,
      status: 'Staying',
    };
    const customerId = saveCustomerWithBooking(booking);

    Alert.alert(
      'Room Booked',
      'Customer ID: ' + customerId + '\nRoom ' + room.number + ' is booked now.\nThis room is not available for other guests.',
    );

    setSelectedRoom('');
    setGuestName('');
    setGuestPhone('');
    setGuestAddress('');
    setBillResult({
      added: true,
      customerId: customerId,
      name: guestName,
      phone: guestPhone,
      address: guestAddress,
      roomNumber: room.number,
      roomType: room.type,
      nights: Number(nights),
      roomCharge: bill.roomCharge,
      bedCharge: bill.bedCharge,
      mealCharge: bill.mealCharge,
      tax: bill.tax,
      total: bill.total,
    });
    setNights('1');
    setExtraBeds('0');
    setMeals('0');
  }

  // check out a guest
  function checkOut(room) {
    const bill = calculateBill(
      room.price,
      room.type,
      room.nights,
      room.extraBeds,
      room.meals,
    );

    const message =
      'Room charge: ' + bill.roomCharge +
      '\nExtra bed: ' + bill.bedCharge +
      '\nMeals: ' + bill.mealCharge +
      '\nTax: ' + bill.tax +
      '\n\nTotal: ' + bill.total;

    Alert.alert('Bill of ' + room.guest, message, [
      {text: 'Cancel'},
      {
        text: 'Check out',
        onPress: () => {
          const newRooms = rooms.map(r => {
            if (r.number === room.number) {
              return {number: r.number, type: r.type, price: r.price, guest: ''};
            }
            return r;
          });
          setRooms(newRooms);
          setEarning(earning + bill.total);

          // keep the data but change status to checked out
          const newList = savedList.map(item => {
            if (item.number === room.number && item.status === 'Staying') {
              return {...item, status: 'Checked out'};
            }
            return item;
          });
          setSavedList(newList);

          // change the status in customer details too
          const newCustomers = customers.map(c => {
            const newBookings = c.bookings.map(b => {
              if (b.number === room.number && b.status === 'Staying') {
                return {...b, status: 'Checked out'};
              }
              return b;
            });
            return {...c, bookings: newBookings};
          });
          setCustomers(newCustomers);
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hotel Management</Text>

      {/* menu buttons */}
      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuBtn} onPress={() => setScreen('home')}>
          <Text style={styles.menuText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuBtn} onPress={() => setScreen('rooms')}>
          <Text style={styles.menuText}>Rooms</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuBtn} onPress={() => setScreen('checkin')}>
          <Text style={styles.menuText}>Check In</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuBtn} onPress={() => setScreen('add')}>
          <Text style={styles.menuText}>Add Room</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuBtn} onPress={() => setScreen('customers')}>
          <Text style={styles.menuText}>Customers</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{padding: 15}}>
        {/* HOME SCREEN */}
        {screen === 'home' && (
          <View>
            <Text style={styles.heading}>Total Rooms: {totalRooms}</Text>
            <Text style={styles.text}>Single Rooms: {singleRooms}</Text>
            <Text style={styles.text}>Double Rooms: {doubleRooms}</Text>
            <Text style={styles.text}>Suite Rooms: {suiteRooms}</Text>
            <Text style={styles.text}>Booked: {bookedRooms}</Text>
            <Text style={styles.text}>Empty: {emptyRooms}</Text>

            <Text style={styles.heading}>Room Prices (per night)</Text>
            <Text style={styles.text}>Single: {SINGLE_PRICE}</Text>
            <Text style={styles.text}>Double: {DOUBLE_PRICE}</Text>
            <Text style={styles.text}>Suite: {SUITE_PRICE}</Text>

            <Text style={styles.heading}>Total Earning: {earning}</Text>
          </View>
        )}

        {/* ROOMS SCREEN */}
        {screen === 'rooms' && (
          <View>
            <Text style={styles.heading}>All Rooms</Text>
            {rooms.map(room => (
              <View key={room.number} style={styles.roomBox}>
                <Text style={styles.text}>
                  Room {room.number} ({room.type}) - {room.price}
                </Text>
                {room.guest === '' ? (
                  <Text style={{color: 'green'}}>Empty</Text>
                ) : (
                  <View>
                    <Text style={{color: 'red'}}>Guest: {room.guest}</Text>
                    <TouchableOpacity
                      style={styles.smallBtn}
                      onPress={() => checkOut(room)}>
                      <Text style={styles.btnText}>Check Out</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* ADD ROOM SCREEN */}
        {screen === 'add' && (
          <View>
            <Text style={styles.heading}>Add New Room</Text>

            <Text style={styles.text}>Room Number</Text>
            <TextInput
              style={styles.input}
              value={newNumber}
              onChangeText={setNewNumber}
              placeholder="e.g. 105"
            />

            <Text style={styles.text}>Room Type: {newType}</Text>
            <View style={{flexDirection: 'row'}}>
              <TouchableOpacity style={styles.smallBtn} onPress={() => chooseType('Single')}>
                <Text style={styles.btnText}>Single</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.smallBtn} onPress={() => chooseType('Double')}>
                <Text style={styles.btnText}>Double</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.smallBtn} onPress={() => chooseType('Suite')}>
                <Text style={styles.btnText}>Suite</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.text}>Price per night</Text>
            <TextInput
              style={styles.input}
              value={newPrice}
              onChangeText={setNewPrice}
              keyboardType="numeric"
            />

            <TouchableOpacity style={styles.bigBtn} onPress={addRoom}>
              <Text style={styles.btnText}>Add Room</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* CUSTOMERS SCREEN */}
        {screen === 'customers' && (
          <View>
            <Text style={styles.heading}>Save Customer</Text>

            <Text style={styles.text}>Name</Text>
            <TextInput style={styles.input} value={custName} onChangeText={setCustName} />

            <Text style={styles.text}>Phone</Text>
            <TextInput
              style={styles.input}
              value={custPhone}
              onChangeText={setCustPhone}
              keyboardType="phone-pad"
            />

            <Text style={styles.text}>Address</Text>
            <TextInput style={styles.input} value={custAddress} onChangeText={setCustAddress} />

            <TouchableOpacity style={styles.bigBtn} onPress={addCustomer}>
              <Text style={styles.btnText}>Save Customer</Text>
            </TouchableOpacity>

            <Text style={styles.heading}>Saved Customers ({customers.length})</Text>
            <Text style={styles.text}>Search by ID or name</Text>
            <TextInput
              style={styles.input}
              value={searchText}
              onChangeText={setSearchText}
              placeholder="e.g. C1 or Ali"
            />
            {customers.length === 0 && (
              <Text style={styles.text}>No customers saved yet</Text>
            )}
            {customers.length > 0 && shownCustomers.length === 0 && (
              <Text style={styles.text}>No customer found</Text>
            )}
            {shownCustomers.map((c, index) => {
              // the bills saved in this customer, add them
              const bookings = c.bookings;
              let totalBill = 0;
              for (let i = 0; i < bookings.length; i++) {
                totalBill = totalBill + bookings[i].total;
              }

              return (
                <View key={c.id} style={styles.roomBox}>
                  <Text style={[styles.text, {fontWeight: 'bold'}]}>ID: {c.id}</Text>
                  <Text style={styles.text}>Name: {c.name}</Text>
                  <Text style={styles.text}>Phone: {c.phone}</Text>
                  <Text style={styles.text}>Address: {c.address}</Text>

                  {bookings.length === 0 && (
                    <Text style={styles.text}>No booking yet</Text>
                  )}
                  {bookings.map((b, i) => (
                    <Text key={i} style={styles.text}>
                      Room {b.number} ({b.nights} night) - {b.total} - {b.status}
                    </Text>
                  ))}
                  <Text style={[styles.text, {fontWeight: 'bold'}]}>
                    Total Bill: {totalBill}
                  </Text>

                  <TouchableOpacity
                    style={[styles.smallBtn, {backgroundColor: '#c0392b'}]}
                    onPress={() => deleteCustomer(c.id)}>
                    <Text style={styles.btnText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}

        {/* CHECK IN SCREEN */}
        {screen === 'checkin' && (
          <View>
            <Text style={styles.heading}>Check In</Text>

            <Text style={styles.text}>Select a room (red = booked, not available):</Text>
            <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
              {rooms.map(r => (
                <TouchableOpacity
                  key={r.number}
                  style={[
                    styles.smallBtn,
                    r.guest !== '' && {backgroundColor: '#c0392b'},
                    selectedRoom === r.number && {backgroundColor: 'green'},
                  ]}
                  onPress={() => {
                    if (r.guest !== '') {
                      Alert.alert(
                        'Room not available',
                        'Room ' + r.number + ' is booked by ' + r.guest + '. Please choose another room.',
                      );
                    } else {
                      setSelectedRoom(r.number);
                      setBillResult(null);
                    }
                  }}>
                  <Text style={styles.btnText}>
                    {r.number} {r.type}
                    {r.guest !== '' ? ' (Booked)' : ''}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {customers.length > 0 && (
              <View>
                <Text style={styles.text}>Saved customers (tap to fill details):</Text>
                <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
                  {customers.map((c, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[styles.smallBtn, {backgroundColor: '#8e44ad'}]}
                      onPress={() => {
                        setGuestName(c.name);
                        setGuestPhone(c.phone);
                        setGuestAddress(c.address);
                        setBillResult(null);
                      }}>
                      <Text style={styles.btnText}>{c.id} {c.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <Text style={styles.text}>Customer Name</Text>
            <TextInput style={styles.input} value={guestName} onChangeText={setGuestName} />

            <Text style={styles.text}>Phone</Text>
            <TextInput
              style={styles.input}
              value={guestPhone}
              onChangeText={setGuestPhone}
              keyboardType="phone-pad"
            />

            <Text style={styles.text}>Address</Text>
            <TextInput style={styles.input} value={guestAddress} onChangeText={setGuestAddress} />

            <Text style={styles.text}>Number of Nights</Text>
            <TextInput
              style={styles.input}
              value={nights}
              onChangeText={setNights}
              keyboardType="numeric"
            />

            <Text style={styles.text}>Extra Beds (double / suite only)</Text>
            <TextInput
              style={styles.input}
              value={extraBeds}
              onChangeText={setExtraBeds}
              keyboardType="numeric"
            />

            <Text style={styles.text}>Meals per day</Text>
            <TextInput
              style={styles.input}
              value={meals}
              onChangeText={setMeals}
              keyboardType="numeric"
            />

            <TouchableOpacity
              style={[styles.bigBtn, {backgroundColor: '#2980b9', marginBottom: 0}]}
              onPress={calculateNow}>
              <Text style={styles.btnText}>Calculate</Text>
            </TouchableOpacity>

            {billResult && (
              <View style={styles.roomBox}>
                <Text style={styles.heading}>
                  {billResult.added ? 'Customer Bill (Checked In)' : 'Customer Bill'}
                </Text>
                <Text style={styles.text}>Customer ID: {billResult.customerId}</Text>
                <Text style={styles.text}>Name: {billResult.name}</Text>
                <Text style={styles.text}>Phone: {billResult.phone}</Text>
                <Text style={styles.text}>Address: {billResult.address}</Text>
                <Text style={styles.text}>
                  Room {billResult.roomNumber} ({billResult.roomType}) - {billResult.nights} night(s)
                </Text>
                <Text style={styles.text}>Room charge: {billResult.roomCharge}</Text>
                <Text style={styles.text}>Extra bed: {billResult.bedCharge}</Text>
                <Text style={styles.text}>Meals: {billResult.mealCharge}</Text>
                <Text style={styles.text}>Tax: {billResult.tax}</Text>
                <Text style={[styles.heading, {color: '#27ae60'}]}>Total Bill: {billResult.total}</Text>
              </View>
            )}

            <TouchableOpacity style={styles.bigBtn} onPress={checkIn}>
              <Text style={styles.btnText}>Add</Text>
            </TouchableOpacity>

            <Text style={styles.heading}>Saved Check-ins ({savedList.length})</Text>
            <Text style={[styles.text, {fontWeight: 'bold'}]}>
              Total Bill of all guests: {allGuestsTotal}
            </Text>
            {savedList.length === 0 && (
              <Text style={styles.text}>No guests saved yet</Text>
            )}
            {savedList.map((item, index) => (
              <View key={index} style={styles.roomBox}>
                <Text style={styles.text}>
                  Room {item.number} ({item.type}) - {item.guest}
                </Text>
                <Text style={styles.text}>
                  Phone: {item.phone}  Address: {item.address}
                </Text>
                <Text style={styles.text}>
                  {item.nights} night(s) - Bill: {item.total}
                </Text>
                <Text style={item.status === 'Staying' ? {color: 'red'} : {color: 'green'}}>
                  {item.status}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f2f2f2'},
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: '#2c3e50',
    color: 'white',
    padding: 15,
  },
  menu: {flexDirection: 'row', backgroundColor: '#34495e'},
  menuBtn: {flex: 1, paddingVertical: 12},
  menuText: {color: 'white', textAlign: 'center', fontSize: 11},
  heading: {fontSize: 20, fontWeight: 'bold', marginTop: 15, marginBottom: 5},
  text: {fontSize: 16, marginTop: 5},
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'gray',
    padding: 8,
    fontSize: 16,
    marginTop: 5,
  },
  roomBox: {
    backgroundColor: 'white',
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  smallBtn: {
    backgroundColor: '#2980b9',
    padding: 8,
    margin: 4,
    borderRadius: 5,
  },
  bigBtn: {
    backgroundColor: '#27ae60',
    padding: 12,
    marginTop: 20,
    marginBottom: 40,
    borderRadius: 5,
  },
  btnText: {color: 'white', textAlign: 'center', fontSize: 16},
});
