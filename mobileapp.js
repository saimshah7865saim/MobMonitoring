// mobtrackapp.js  -  MobTrack: the WHOLE app in ONE file.
// Parts (top to bottom): 1) demo data  2) reusable components  3) screens  4) App
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, SafeAreaView, StatusBar, Alert,
} from 'react-native';


// ============================================================
// DEMO DATA
// ============================================================
// data.js - all the fake (demo) data lives here. Later you can replace it with real data from a server.

const drones = [
  { id: 'D1', status: 'Live',      task: 'Tracking Mob A',    zone: 'Sector 7-A',    left: '58 min', battery: 82,  group: 'Live' },
  { id: 'D2', status: 'Returning', task: 'Returning to base', zone: '—',             left: '2 min',  battery: 14,  group: 'Returning' },
  { id: 'D3', status: 'Active',    task: 'Covering Mob B',    zone: 'Sector 7-C',    left: '29 min', battery: 67,  group: 'Live' },
  { id: 'D4', status: 'Charging',  task: 'Charging',          zone: 'Base',          left: '—',      battery: 38,  group: 'Offline' },
  { id: 'D5', status: 'En route',  task: 'Substitute for D2', zone: '→ Sector 7-B',  left: '54 min', battery: 96,  group: 'Returning' },
  { id: 'D6', status: 'Standby',   task: 'Standby · ready',   zone: 'BS-07',         left: '—',      battery: 100, group: 'Offline' },
];

// badge colour for every drone status
const statusColor = {
  Live: 'green', Active: 'green', Returning: 'orange',
  'En route': 'blue', Charging: 'gray', Standby: 'gray',
};

const units = [
  { id: 12, name: 'Unit 12', type: 'Sector 7 patrol', officers: 4, station: 'Central Station',   eta: 2 },
  { id: 5,  name: 'Unit 5',  type: 'Rapid response',  officers: 3, station: 'North Station',     eta: 5 },
  { id: 9,  name: 'Unit 9',  type: 'Crowd control',   officers: 6, station: 'Riverside Station', eta: 9 },
];

// "target" = which tab the button opens (different for each role)
const alerts = [
  { id: 1, level: 'High', owner: 'police', title: 'Convergence risk — A.1 × B',
    text: 'Two mobs (~350 people combined) reach the Sector 7-C bottleneck in about 4 minutes.' },
  { id: 2, level: 'High', owner: 'base', title: 'Zone 4 has no drone coverage',
    text: 'Drone D6 is ready at BS-07. Assign it to Zone 4 before launch.',
    button: 'Close the gap', target: { base: 'Base station', police: 'Drones' } },
  { id: 3, level: 'Medium', owner: 'base', title: 'Drone D2 low battery',
    text: '14% left, returning to base. Substitute D5 is on the way, ETA 3 minutes.',
    button: 'Track D2', target: { base: 'Drones', police: 'Drones' } },
  { id: 4, level: 'Low', owner: 'police', title: 'Mob A is growing',
    text: 'Estimated +62 people in the next 10 minutes in Sector 7-A.',
    button: 'View zone', target: { base: 'Dashboard', police: 'Dashboard' } },
  { id: 5, level: 'Low', owner: 'base', title: 'Drone D4 charging',
    text: 'Battery at 38%. It will be ready in about 40 minutes.',
    button: 'Open drones', target: { base: 'Drones', police: 'Drones' } },
];

const history = [
  { id: 1, date: 'Sep 24, 09:33', title: 'Convergence — A.1 × A.2', zone: 'Sector 7-C', size: '180', officers: 4, result: 'Dispersed', color: 'green' },
  { id: 2, date: 'Sep 23, 17:20', title: 'Rapid growth — Mob B',    zone: 'Sector 5',   size: '240', officers: 5, result: 'Dispersed', color: 'green' },
  { id: 3, date: 'Sep 22, 12:48', title: 'Drone D3 low battery',    zone: 'Sector 7-C', size: '—',   officers: 0, result: 'Handed over', color: 'blue' },
];


// ============================================================
// REUSABLE COMPONENTS
// ============================================================
// components.js - small reusable pieces (Card, Button, Badge ...) used by every screen.

const colors = {
  blue: '#2F6FED', blueLight: '#E8F0FE', bg: '#F6F7F9', border: '#E3E6EA',
  text: '#111827', grey: '#6B7280',
  green: '#1F9D63', greenLight: '#E3F5EC',
  red: '#DC4545', redLight: '#FDE8E8',
  orange: '#B7791F', orangeLight: '#FDF0D8', purple: '#7C4DDB',
};

const tone = {
  green: [colors.greenLight, colors.green],
  red: [colors.redLight, colors.red],
  orange: [colors.orangeLight, colors.orange],
  blue: [colors.blueLight, colors.blue],
  gray: ['#EEF0F3', colors.grey],
};

// Small coloured label, e.g. "Live" or "High"
function Badge({ text, color = 'gray' }) {
  return (
    <View style={[s.badge, { backgroundColor: tone[color][0] }]}>
      <Text style={{ color: tone[color][1], fontSize: 12, fontWeight: '600' }}>{text}</Text>
    </View>
  );
}

// White box with a border
function Card({ children, style }) {
  return <View style={[s.card, style]}>{children}</View>;
}

// kind = 'primary' (blue) | 'danger' (red) | 'light' (white)
function Button({ title, onPress, kind = 'primary', disabled = false, style }) {
  let bg = kind === 'primary' ? colors.blue : kind === 'danger' ? colors.red : '#fff';
  let fg = kind === 'light' ? colors.text : '#fff';
  if (disabled) { bg = '#E5E7EB'; fg = colors.grey; }
  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      style={[s.button, { backgroundColor: bg, borderColor: kind === 'light' ? colors.border : bg }, style]}>
      <Text style={{ color: fg, fontWeight: '600', fontSize: 15 }}>{title}</Text>
    </TouchableOpacity>
  );
}

// Top bar: "← Home" button (only when onHome is given) + logo on the left, role badge on the right
function Header({ badge, onHome, onLogout }) {
  return (
    <View style={s.header}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {onHome ? (
          <TouchableOpacity onPress={onHome} style={s.homeBtn}>
            <Text style={{ color: colors.blue, fontWeight: '600' }}>← Home</Text>
          </TouchableOpacity>
        ) : null}
        <Text style={s.logo}>Mob<Text style={{ color: colors.blue }}>Track</Text></Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {/* Log out = go back to the very first screen (choose role) */}
        {onLogout ? (
          <TouchableOpacity onPress={onLogout} style={[s.homeBtn, { backgroundColor: colors.redLight, marginRight: 8 }]}>
            <Text style={{ color: colors.red, fontWeight: '600' }}>Log out</Text>
          </TouchableOpacity>
        ) : null}
        <View style={s.avatar}><Text style={{ fontWeight: '600', color: colors.blue }}>{badge}</Text></View>
      </View>
    </View>
  );
}

// Big page title + small grey line + optional green "Live" line
function Title({ title, sub, live, liveColor = colors.green }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={s.title}>{title}</Text>
      {sub ? <Text style={s.grey}>{sub}</Text> : null}
      {live ? <Text style={{ color: liveColor, marginTop: 6, fontSize: 13 }}>● {live}</Text> : null}
    </View>
  );
}

// Rows that wrap (used for the 2x2 number boxes)
function Grid({ children }) {
  return <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>{children}</View>;
}

// One number box: label, big value, small text
function Stat({ label, value, sub, color = colors.text }) {
  return (
    <Card style={{ width: '48%' }}>
      <Text style={s.grey}>{label}</Text>
      <Text style={{ fontSize: 28, fontWeight: '700', color }}>{value}</Text>
      <Text style={[s.grey, { fontSize: 12 }]}>{sub}</Text>
    </Card>
  );
}

// Battery bar. Red under 20%, orange under 50%, green otherwise.
function Battery({ percent }) {
  const c = percent < 20 ? colors.red : percent < 50 ? colors.orange : colors.green;
  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={s.grey}>Battery</Text>
        <Text style={{ color: c, fontWeight: '600' }}>{percent}%</Text>
      </View>
      <View style={s.track}><View style={[s.fill, { width: percent + '%', backgroundColor: c }]} /></View>
    </View>
  );
}

// One drone card (used on the Drones screen)
function DroneCard({ drone }) {
  return (
    <Card>
      <View style={s.row}>
        <Text style={s.cardTitle}>{drone.id}</Text>
        <Badge text={drone.status} color={statusColor[drone.status]} />
      </View>
      <Text style={{ fontWeight: '600', marginVertical: 8 }}>{drone.task}</Text>
      <View style={s.row}>
        <View><Text style={s.grey}>Zone</Text><Text>{drone.zone}</Text></View>
        <View><Text style={s.grey}>Flight time left</Text><Text>{drone.left}</Text></View>
      </View>
      <View style={{ marginTop: 10 }}><Battery percent={drone.battery} /></View>
    </Card>
  );
}

// Row of small filter buttons: All / Live / Returning ...
function Chips({ options, value, onChange }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 }}>
      {options.map((o) => (
        <TouchableOpacity key={o} onPress={() => onChange(o)}
          style={[s.chip, value === o && { backgroundColor: colors.blueLight }]}>
          <Text style={{ color: value === o ? colors.blue : colors.grey, fontWeight: '600' }}>{o}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// A simple pretend city map: grey blocks + coloured labels (tags)
const tagColor = { blue: colors.blue, purple: colors.purple, red: colors.red, green: colors.green, orange: colors.orange, grey: '#6B7280' };
function FakeMap({ tags = [], height = 190 }) {
  return (
    <View style={[s.map, { height }]}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around' }}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => <View key={i} style={s.block} />)}
      </View>
      {tags.map((t, i) => (
        <Text key={i} style={[s.tag, { top: t.top, left: t.left, backgroundColor: tagColor[t.color] }]}>{t.text}</Text>
      ))}
    </View>
  );
}

// Bottom menu. tabs = list of names, active = the selected one
function TabBar({ tabs, active, onChange }) {
  return (
    <View style={s.tabbar}>
      {tabs.map((t) => (
        <TouchableOpacity key={t} onPress={() => onChange(t)}
          style={[s.tab, active === t && { backgroundColor: colors.blueLight }]}>
          <Text style={{ fontSize: 12, fontWeight: '600', color: active === t ? colors.blue : colors.grey }}>{t}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  page: { padding: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  grey: { color: colors.grey, fontSize: 13 },
  title: { fontSize: 26, fontWeight: '700', color: colors.text },
  cardTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  section: { fontSize: 20, fontWeight: '700', marginVertical: 10, color: colors.text },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  card: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 14, marginBottom: 12 },
  button: { borderWidth: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: colors.border },
  logo: { fontSize: 22, color: colors.text },
  homeBtn: { backgroundColor: colors.blueLight, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, marginRight: 10 },
  avatar: { width: 40, height: 40, borderRadius: 10, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  track: { height: 7, backgroundColor: '#EEF0F3', borderRadius: 4, marginTop: 4 },
  fill: { height: 7, borderRadius: 4 },
  chip: { backgroundColor: '#EEF0F3', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, marginRight: 8, marginBottom: 6 },
  map: { backgroundColor: '#E8EBEE', borderRadius: 10, overflow: 'hidden', paddingVertical: 4, marginVertical: 8 },
  block: { width: '22%', height: 44, marginVertical: 8, backgroundColor: '#CBD2D9', borderRadius: 4 },
  tag: { position: 'absolute', color: '#fff', fontSize: 11, fontWeight: '600', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 5, overflow: 'hidden' },
  tabbar: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: '#fff', borderTopWidth: 1, borderColor: colors.border, padding: 4 },
  tab: { width: '33.33%', paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
});


// ============================================================
// SCREEN: RoleScreen.js
// ============================================================
// RoleScreen.js - first screen: choose who you are. Each role has its own login + dashboard.

function RoleScreen({ onPick }) {
  return (
    <View style={[s.page, { paddingTop: 60 }]}>
      <Text style={{ fontSize: 40, color: colors.text }}>Mob<Text style={{ color: colors.blue }}>Track</Text></Text>
      <Text style={[s.grey, { marginBottom: 24 }]}>Drone-footage crowd monitoring. Choose your role:</Text>
      <Card>
        <Text style={s.cardTitle}>Base Station User</Text>
        <Text style={s.grey}>Manage drones</Text>
        <Button title="Continue as Base Station" onPress={() => onPick('base')} />
      </Card>
      <Card>
        <Text style={s.cardTitle}>Police Station Officer</Text>
        <Text style={s.grey}>Monitor risk and dispatch officers</Text>
        <Button title="Continue as Police Officer" onPress={() => onPick('police')} />
      </Card>
      <Card>
        <Text style={s.cardTitle}>Field Officer</Text>
        <Text style={s.grey}>Reach the destination</Text>
        <Button title="Continue as Field Officer" onPress={() => onPick('field')} />
      </Card>
    </View>
  );
}


// ============================================================
// SCREEN: LoginScreen.js
// ============================================================
// LoginScreen.js - one login screen used by all 3 roles (only the labels change).

const roles = {
  base: { name: 'Base Station User', hint: 'Sign in with your base station credentials',
    f1: ['Base Station ID / Call sign', 'e.g. BS-07'], f2: ['Operator ID', 'e.g. OP-0417'],
    note: 'Launch drones · Manage fleet coverage · Monitor live feeds' },
  police: { name: 'Police Station Officer', hint: 'Sign in with your station credentials',
    f1: ['Station ID — Police Station', 'e.g. PST-042'], f2: ['Badge Number', 'e.g. B-7741'],
    note: 'Monitor mob movements · Manage red zone alerts · Assign field officers' },
  field: { name: 'Field Officer', hint: 'Sign in with your officer credentials',
    f1: ['Officer ID / Badge Number', 'e.g. B-7741'], f2: ['Unit Call Sign', 'e.g. U12'],
    note: 'View your assignment · Follow crowd movements · Stay connected to station command' },
};

function LoginScreen({ role, onLogin, onBack }) {
  const r = roles[role];
  const [id1, setId1] = useState('');
  const [id2, setId2] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false); // show / hide the password

  return (
    <View style={[s.page, { paddingTop: 40 }]}>
      <Text style={{ fontSize: 40, color: colors.text }}>Mob<Text style={{ color: colors.blue }}>Track</Text></Text>
      <View style={{ marginVertical: 10 }}><Badge text={r.name} color="blue" /></View>
      <Text style={[s.grey, { fontSize: 16, marginBottom: 14 }]}>{r.hint}</Text>

      <Text style={loginStyles.label}>{r.f1[0]}</Text>
      <TextInput style={loginStyles.input} placeholder={r.f1[1]} value={id1} onChangeText={setId1} />

      <Text style={loginStyles.label}>{r.f2[0]}</Text>
      <TextInput style={loginStyles.input} placeholder={r.f2[1]} value={id2} onChangeText={setId2} />

      <Text style={loginStyles.label}>Password</Text>
      <View>
        <TextInput style={loginStyles.input} placeholder="••••••••" secureTextEntry={!show}
          value={password} onChangeText={setPassword} />
        <TouchableOpacity style={loginStyles.eye} onPress={() => setShow(!show)}>
          <Text style={{ color: colors.blue }}>{show ? 'Hide' : 'Show'}</Text>
        </TouchableOpacity>
      </View>

      <Button title="Sign in" onPress={onLogin} style={{ marginTop: 16 }} />
      <Text style={[s.grey, { marginTop: 16 }]}>Authorized personnel only</Text>
      <Text style={[s.grey, { marginTop: 6 }]}>{r.note}</Text>
      <TouchableOpacity onPress={onBack}><Text style={{ color: colors.blue, marginTop: 20 }}>← Change role</Text></TouchableOpacity>
      <Text style={[s.grey, { marginTop: 20, fontSize: 12 }]}>Agency PSCA-0417 · Secure operations access</Text>
    </View>
  );
}

const loginStyles = StyleSheet.create({
  label: { fontWeight: '600', marginTop: 12, marginBottom: 6, color: colors.text },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, fontSize: 15 },
  eye: { position: 'absolute', right: 14, top: 14 },
});


// ============================================================
// SCREEN: BaseDashboard.js
// ============================================================
// BaseDashboard.js - "Drone Operations" (Base station user's home screen)

function BaseDashboard({ go }) {
  return (
    <View style={s.page}>
      <Title title="Drone Operations" sub="Sector 7 · Base Station BS-07 · City Centre" live="Live · 4 drones airborne · 12:04" />
      <Grid>
        <Stat label="Total drones" value="6" sub="BS-07 fleet" />
        <Stat label="Covering" value="2" sub="D1 · D3" color={colors.green} />
        <Stat label="Returning / en route" value="2" sub="D2 · D5" color={colors.orange} />
        <Stat label="At base" value="2" sub="D4 charging · D6 ready" />
      </Grid>

      <Card style={{ backgroundColor: colors.redLight, borderColor: colors.red }}>
        <Text style={[s.cardTitle, { fontSize: 20 }]}>D2 · Low battery — 14%</Text>
        <Text style={{ color: colors.red, marginVertical: 8 }}>
          Returning to BS-07 · 2 min flight time left. Keep the landing pad clear.
        </Text>
        <Text style={{ fontWeight: '600' }}>D5 replacing D2 → Sector 7-B</Text>
        <Text style={s.grey}>96% · 54 min left · arrival in 3 min</Text>
        <Button title="View D2 return" kind="light" onPress={() => go('Drones')} />
      </Card>
    </View>
  );
}


// ============================================================
// SCREEN: DronesScreen.js
// ============================================================
// DronesScreen.js - fleet status and battery of every drone

function DronesScreen() {
  return (
    <View style={s.page}>
      <Title title="Drones" sub="Fleet status and battery" live="Live · 4 drones active · 12:04" />
      <Grid>
        <Stat label="Total drones" value="6" sub="BS-07 fleet" />
        <Stat label="Covering" value="2" sub="D1 · D3" color={colors.green} />
        <Stat label="Returning / en route" value="2" sub="D2 · D5" color={colors.orange} />
        <Stat label="At base" value="2" sub="D4 charging · D6 ready" />
      </Grid>
      <Text style={s.section}>Fleet telemetry</Text>
      {/* map() makes one DroneCard for every drone in the list */}
      {drones.map((d) => <DroneCard key={d.id} drone={d} />)}
    </View>
  );
}


// ============================================================
// SCREEN: DroneFeedsScreen.js
// ============================================================
// DroneFeedsScreen.js - each drone's live view, with filter buttons

function DroneFeedsScreen() {
  const [filter, setFilter] = useState('All');
  // keep only the drones that match the selected filter
  const shown = drones.filter((d) => filter === 'All' || d.group === filter);

  return (
    <View style={s.page}>
      <Title title="Drone Feeds" sub="All drones · feed refreshes every 8 seconds" live="Live · 4 drones active · 12:04" />
      <Chips options={['All', 'Live', 'Returning', 'Offline']} value={filter} onChange={setFilter} />

      {shown.map((d) => (
        <Card key={d.id}>
          <View style={s.row}>
            <Text style={s.cardTitle}>{d.id} · {d.zone}</Text>
            <Badge text={d.status} color={statusColor[d.status]} />
          </View>
          <FakeMap height={150} tags={d.group === 'Live' ? [{ text: 'Mob · ~340', color: 'blue', top: 60, left: '25%' }] : []} />
          <Battery percent={d.battery} />
          <Text style={[s.grey, { marginTop: 8 }]}>{d.task} · updated 4s ago</Text>
          <Button title="View zone & feed" kind="light" onPress={() => {}} />
        </Card>
      ))}
    </View>
  );
}


// ============================================================
// SCREEN: AlertsScreen.js
// ============================================================
// AlertsScreen.js - list of alerts. Base station sees drone alerts, police see all alerts.

const levelColor = { High: 'red', Medium: 'orange', Low: 'gray' };

function AlertsScreen({ role, go }) {
  const [filter, setFilter] = useState('All');
  const mine = alerts.filter((a) => role === 'police' || a.owner === 'base');
  const shown = mine.filter((a) => filter === 'All' || a.level === filter);

  return (
    <View style={s.page}>
      <Title title="Alerts" sub={mine.length + ' active'} live="Live · 4 drones active · 12:04" />
      <Chips options={['All', 'High', 'Medium', 'Low']} value={filter} onChange={setFilter} />

      {shown.map((a) => (
        <Card key={a.id}>
          <Badge text={a.level} color={levelColor[a.level]} />
          <Text style={[s.cardTitle, { marginVertical: 8 }]}>{a.title}</Text>
          <Text style={s.grey}>{a.text}</Text>

          {/* the big convergence alert has two buttons, but only the police can dispatch */}
          {a.id === 1 ? (
            <View style={{ flexDirection: 'row' }}>
              <Button title="View zone" kind="light" style={{ flex: 1, marginRight: 8 }} onPress={() => go('Dashboard')} />
              <Button title="Dispatch" kind="danger" style={{ flex: 1 }} onPress={() => go('Dispatch')} />
            </View>
          ) : (
            <Button title={a.button} kind="light" onPress={() => go(a.target[role])} />
          )}
        </Card>
      ))}
    </View>
  );
}


// ============================================================
// SCREEN: HistoryScreen.js
// ============================================================
// HistoryScreen.js - past alerts and dispatches

function HistoryScreen() {
  return (
    <View style={s.page}>
      <Title title="History" sub="Past alerts and dispatches" />
      {history.map((h) => (
        <Card key={h.id}>
          <Text style={s.grey}>{h.date}</Text>
          <Text style={[s.cardTitle, { marginVertical: 8 }]}>{h.title}</Text>
          <View style={s.row}>
            <View><Text style={s.grey}>Zone</Text><Text>{h.zone}</Text></View>
            <Badge text={h.result} color={h.color} />
          </View>
          <View style={[s.row, { marginTop: 8 }]}>
            <View><Text style={s.grey}>Peak size</Text><Text>{h.size}</Text></View>
            <View><Text style={s.grey}>Officers</Text><Text>{h.officers}</Text></View>
          </View>
        </Card>
      ))}
    </View>
  );
}


// ============================================================
// SCREEN: BaseStationScreen.js
// ============================================================
// BaseStationScreen.js - fleet control: assign a drone to a zone and launch it

function BaseStationScreen() {
  const [launched, setLaunched] = useState(false); // false = still on the ground

  return (
    <View style={s.page}>
      <Title title="Fleet control" sub="Assign drones to zones and launch" />

      <Card style={{ backgroundColor: colors.blueLight, borderColor: colors.blue }}>
        <View style={s.row}>
          <Text style={s.cardTitle}>D6</Text>
          <Badge text={launched ? 'Launched' : 'Standby'} color={launched ? 'green' : 'gray'} />
        </View>
        <Text style={{ fontWeight: '600', marginVertical: 8 }}>{launched ? 'Flying to Zone 4' : 'Standby · ready'}</Text>
        <Battery percent={100} />
        <Button
          title={launched ? 'D6 launched ✓' : 'Assign & launch'}
          disabled={launched}
          onPress={() => setLaunched(true)} />
      </Card>

      <Card>
        <Text style={s.cardTitle}>Close the Zone 4 coverage gap</Text>
        <View style={{ marginVertical: 8 }}><Badge text={launched ? 'Coverage restored' : 'No drone coverage'} color={launched ? 'green' : 'orange'} /></View>
        <Text style={s.grey}>
          D6 is ready at BS-07. Assign the standby drone to Zone 4 before launch. Launches require a zone assignment and preflight check.
        </Text>
      </Card>

      <Text style={s.section}>Coverage & movement</Text>
      <FakeMap height={200} tags={[
        { text: 'Mob A.1 · ~140', color: 'blue', top: 20, left: '30%' },
        { text: 'Red Zone 7-C', color: 'red', top: 80, left: '55%' },
        { text: 'Zone 4 · no coverage', color: launched ? 'green' : 'red', top: 120, left: '3%' },
        { text: 'D1', color: 'green', top: 150, left: '25%' },
        { text: 'BS-07', color: 'grey', top: 160, left: '70%' },
      ]} />
    </View>
  );
}


// ============================================================
// SCREEN: PoliceDashboard.js
// ============================================================
// PoliceDashboard.js - "Crowd Intelligence" (Police officer's home screen)

const mobs = [
  { name: 'Mob A (main)', size: '~340', dir: 'SW', color: 'blue' },
  { name: 'Mob A.1 (split)', size: '~140', dir: '→ 7-C', color: 'red' },
  { name: 'Mob A.2 (split)', size: '~190', dir: 'SE', color: 'blue' },
  { name: 'Mob B', size: '~210', dir: '→ 7-C', color: 'red' },
];

function PoliceDashboard({ go }) {
  return (
    <View style={s.page}>
      <Title title="Crowd Intelligence" sub="Sector 7 · Police Station Command · City Centre"
        live="Critical · Convergence in ~4 min · 12:04" liveColor={colors.red} />

      <Card style={{ backgroundColor: colors.redLight, borderColor: colors.red }}>
        <Text style={{ color: colors.red }}>Critical</Text>
        <Text style={[s.cardTitle, { fontSize: 20, marginVertical: 6 }]}>Convergence Risk — A.1 × B</Text>
        <Text style={{ color: colors.red, marginBottom: 8 }}>~350 people meeting at Red Zone 7-C in ~4 min.</Text>
        <View style={s.row}>
          <View><Text style={s.grey}>Mob A.1</Text><Text style={{ fontWeight: '600' }}>~140 · N → S</Text></View>
          <View><Text style={s.grey}>Mob B</Text><Text style={{ fontWeight: '600' }}>~210 · E → W</Text></View>
        </View>
      </Card>

      <FakeMap height={200} tags={[
        { text: 'A.1 · ~140', color: 'blue', top: 15, left: '35%' },
        { text: 'B · ~210', color: 'purple', top: 55, left: '60%' },
        { text: 'Red Zone 7-C', color: 'red', top: 85, left: '50%' },
        { text: 'Zone 4 · no coverage', color: 'red', top: 100, left: '3%' },
        { text: 'U12', color: 'blue', top: 130, left: '45%' },
        { text: 'D3', color: 'green', top: 125, left: '85%' },
        { text: 'D1', color: 'green', top: 165, left: '10%' },
      ]} />

      <Card>
        <Text style={[s.cardTitle, { marginBottom: 8 }]}>Crowd Overview</Text>
        {mobs.map((m) => (
          <View key={m.name} style={[s.row, { marginVertical: 6 }]}>
            <Text>{m.name}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontWeight: '600', marginRight: 8, color: m.color === 'red' ? colors.red : colors.text }}>{m.size}</Text>
              <Badge text={m.dir} color={m.color} />
            </View>
          </View>
        ))}
      </Card>

      <Text style={s.section}>Assign Officers · 7-C</Text>
      <Badge text="Recommended: 6 officers" color="blue" />
      <Card style={{ backgroundColor: colors.blueLight, borderColor: colors.blue, marginTop: 10 }}>
        <View style={s.row}>
          <Text style={{ fontWeight: '700' }}>Unit 12 · Sector 7 patrol</Text>
          <Text style={{ color: colors.blue }}>2 min</Text>
        </View>
        <Text style={s.grey}>4 officers · Central Station</Text>
        <Button title="Dispatch to 7-C" onPress={() => go('Dispatch')} />
      </Card>
    </View>
  );
}


// ============================================================
// SCREEN: DispatchScreen.js
// ============================================================
// DispatchScreen.js - choose how many officers, pick units, confirm dispatch

function DispatchScreen({ go }) {
  const [count, setCount] = useState(6);   // requested officers
  const [picked, setPicked] = useState([]); // ids of selected units
  const [done, setDone] = useState(false);  // true after "Confirm dispatch"

  // add the unit if not picked yet, remove it if already picked
  const toggle = (id) => setPicked(picked.includes(id) ? picked.filter((x) => x !== id) : [...picked, id]);
  const chosen = units.filter((u) => picked.includes(u.id));
  const officers = chosen.reduce((total, u) => total + u.officers, 0);

  if (done) {
    return (
      <View style={s.page}>
        <Card style={{ backgroundColor: colors.greenLight, borderColor: colors.green }}>
          <Text style={[s.cardTitle, { color: colors.green }]}>Dispatch confirmed ✓</Text>
          <Text style={{ marginTop: 6 }}>{chosen.length} unit(s) · {officers} officers are on the way to Sector 7-C.</Text>
        </Card>
        <Button title="Back to dashboard" onPress={() => go('Dashboard')} />
      </View>
    );
  }

  return (
    <View style={s.page}>
      <Title title="Dispatch" sub="Sector 7-C" />

      <Card>
        <Badge text="High" color="red" />
        <Text style={[s.cardTitle, { marginVertical: 8 }]}>Convergence risk — A.1 × B</Text>
        <Text style={s.grey}>~350 people meeting at the Sector 7-C bottleneck in about 4 minutes.</Text>
      </Card>

      <Card>
        <View style={s.row}>
          <View><Text style={s.grey}>Recommended officers</Text><Text style={{ fontWeight: '600' }}>6 officers</Text></View>
          <Badge text="Recommendation" color="blue" />
        </View>
        <View style={[s.row, { marginTop: 12 }]}>
          <TouchableOpacity style={dispatchStyles.round} onPress={() => setCount(Math.max(0, count - 1))}><Text style={dispatchStyles.sign}>−</Text></TouchableOpacity>
          <Text style={{ fontSize: 40, fontWeight: '700' }}>{count}</Text>
          <TouchableOpacity style={dispatchStyles.round} onPress={() => setCount(count + 1)}><Text style={dispatchStyles.sign}>+</Text></TouchableOpacity>
        </View>
      </Card>

      <Text style={s.section}>Select units</Text>
      {units.map((u) => {
        const on = picked.includes(u.id);
        return (
          <Card key={u.id} style={on ? { borderColor: colors.blue, backgroundColor: colors.blueLight } : {}}>
            <Text style={{ fontWeight: '700' }}>{u.name} · {u.type}</Text>
            <Text style={s.grey}>{u.officers} officers · {u.station}</Text>
            <View style={[s.row, { marginTop: 6 }]}>
              <Text style={s.grey}>Response ETA to 7-C: {u.eta} min away</Text>
              <Badge text={on ? 'Selected' : 'Not selected'} color={on ? 'blue' : 'gray'} />
            </View>
            <Button title={on ? 'Unselect ' + u.name : 'Select ' + u.name} kind="light" onPress={() => toggle(u.id)} />
          </Card>
        );
      })}

      <Card>
        <View style={s.row}>
          <View><Text style={s.grey}>Selected units</Text><Text style={{ fontWeight: '600' }}>{chosen.length} units</Text></View>
          <View><Text style={s.grey}>Selected officers</Text><Text style={{ fontWeight: '600' }}>{officers} officers</Text></View>
        </View>
      </Card>

      {/* the button stays grey until at least one unit is selected */}
      <Button title="Confirm dispatch" disabled={chosen.length === 0} onPress={() => setDone(true)} />
      <Button title="Cancel" kind="light" onPress={() => { setPicked([]); go('Alerts'); }} />
    </View>
  );
}

const dispatchStyles = StyleSheet.create({
  round: { width: 48, height: 48, borderRadius: 10, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  sign: { fontSize: 24, color: colors.text },
});


// ============================================================
// SCREEN: UnitsScreen.js
// ============================================================
// UnitsScreen.js - police units list with search and quick actions

function UnitsScreen() {
  const [search, setSearch] = useState('');
  const [openId, setOpenId] = useState(12); // unit whose actions are visible

  const text = search.toLowerCase();
  const shown = units.filter((u) => (u.name + u.type + u.station).toLowerCase().includes(text));

  return (
    <View style={s.page}>
      <Title title="Police Units & Stations" sub="Sector 7 · Unit readiness and station capacity" live="Live · 6 units on duty · 12:04" />

      <Card>
        <View style={s.row}>
          <View><Text style={s.grey}>Units on duty</Text><Text style={{ fontWeight: '600' }}>6 units · 25 officers</Text></View>
          <View><Text style={s.grey}>Available</Text><Text style={{ fontWeight: '600' }}>3 units · 13 officers</Text></View>
        </View>
      </Card>

      <TextInput
        style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, marginBottom: 12 }}
        placeholder="Search unit, officer or sector" value={search} onChangeText={setSearch} />

      {shown.map((u) => (
        <Card key={u.id} style={openId === u.id ? { borderColor: colors.blue, backgroundColor: colors.blueLight } : {}}>
          <View style={s.row}>
            <Text style={s.cardTitle}>{u.name}</Text>
            <Badge text="Available" color="green" />
          </View>
          <Text style={s.grey}>{u.type} · {u.officers} officers · {u.station}</Text>
          <Text style={{ marginTop: 6 }}>Response ETA: {u.eta} min away</Text>

          {openId === u.id ? (
            <View>
              <Button title="Radio unit" kind="light" onPress={() => Alert.alert('Radio', 'Calling ' + u.name + ' on channel 07...')} />
              <Button title="Send message" kind="light" onPress={() => Alert.alert('Message', 'Message sent to ' + u.name)} />
              <Button title={'Return to ' + u.station} kind="light" onPress={() => Alert.alert('Return', u.name + ' is returning to station.')} />
            </View>
          ) : (
            <Button title={'Open ' + u.name} kind="light" onPress={() => setOpenId(u.id)} />
          )}
        </Card>
      ))}
    </View>
  );
}


// ============================================================
// SCREEN: FieldScreens.js
// ============================================================
// FieldScreens.js - the 4 screens of the Field Officer (kept in one file because they are small)

// 1) My assignment: read it, acknowledge it, then mark arrival
function FieldAssignment() {
  const [ack, setAck] = useState(false);
  const [arrived, setArrived] = useState(false);

  return (
    <View style={s.page}>
      <Title title="My Assignment" sub="Sgt. Ali Khan · Unit 12 / U12 · Central Station" live="Critical · Convergence in ~4 min · 12:04" liveColor={colors.red} />
      <Card>
        <Badge text={arrived ? 'Arrived' : ack ? 'Acknowledged' : 'Awaiting acknowledgement'} color={arrived ? 'green' : ack ? 'blue' : 'orange'} />
        <Text style={[s.cardTitle, { marginVertical: 8 }]}>Sector 7-C bottleneck</Text>
        <View style={s.row}>
          <View><Text style={s.grey}>Incident</Text><Text>A.1 × B convergence</Text></View>
          <View><Text style={s.grey}>Priority</Text><Text>High · Red zone</Text></View>
        </View>
        <View style={[s.row, { marginTop: 8 }]}>
          <View><Text style={s.grey}>Your unit</Text><Text>U12 · 4 officers</Text></View>
          <View><Text style={s.grey}>Approach / ETA</Text><Text>Civic Road · 2 min</Text></View>
        </View>
        <Button title={ack ? 'Assignment acknowledged ✓' : '✓ Acknowledge assignment'} disabled={ack} onPress={() => setAck(true)} />
        {/* you can only mark arrival AFTER acknowledging */}
        <Button title={arrived ? 'Arrival reported ✓' : 'Mark arrival at 7-C'} kind="light" disabled={!ack || arrived} onPress={() => setArrived(true)} />
        <Text style={[s.grey, { marginTop: 8, fontSize: 12 }]}>Acknowledge first. Mark arrival when you reach the destination.</Text>
      </Card>
    </View>
  );
}

// 2) Movement map: approach route and crowd movement
function FieldMap() {
  return (
    <View style={s.page}>
      <Title title="Approach route & crowd movement" sub="Your GPS · Civic Road, Sector 7-A · updated 2s ago" />
      <Badge text="2 min to destination" color="blue" />
      <FakeMap height={220} tags={[
        { text: 'A.1 · ~140', color: 'blue', top: 15, left: '35%' },
        { text: 'B · ~210', color: 'purple', top: 55, left: '60%' },
        { text: 'Red Zone 7-C', color: 'red', top: 90, left: '50%' },
        { text: 'Mob A · ~340 · SW', color: 'blue', top: 150, left: '5%' },
        { text: 'You · U12', color: 'blue', top: 185, left: '15%' },
      ]} />
      <Text style={[s.grey, { fontSize: 12 }]}>Crowd observations refresh every 8s. Predictions, not confirmed arrivals.</Text>
    </View>
  );
}

// 3) Risk alert
function FieldRisk() {
  return (
    <View style={s.page}>
      <Title title="Risk Alert" sub="Sgt. Ali Khan · Unit 12 / U12 · Central Station" live="Critical · Convergence in ~4 min · 12:04" liveColor={colors.red} />
      <Card style={{ backgroundColor: colors.redLight, borderColor: colors.red }}>
        <Text style={{ color: colors.red }}>Critical</Text>
        <Text style={[s.cardTitle, { fontSize: 20, marginVertical: 6 }]}>Red Zone 7-C</Text>
        <Text style={{ color: colors.red, marginBottom: 8 }}>~350 people may converge at the bottleneck in ~4 min (12:08).</Text>
        <View style={s.row}>
          <View><Text style={s.grey}>Mob A.1</Text><Text style={{ fontWeight: '600' }}>~140 · N → S</Text></View>
          <View><Text style={s.grey}>Mob B</Text><Text style={{ fontWeight: '600' }}>~210 · E → W</Text></View>
        </View>
        <Text style={[s.grey, { marginTop: 8, fontSize: 12 }]}>Predictions, not confirmed arrivals.</Text>
      </Card>
    </View>
  );
}

// 4) Radio contact
function FieldRadio() {
  return (
    <View style={s.page}>
      <Title title="Radio contact" sub="Channel 07 · Station command" />
      <Card>
        <Text style={s.grey}>Call sign U12. Keep command informed of route changes and crowd movement.</Text>
        <Button title="Radio command" kind="light" onPress={() => Alert.alert('Radio', 'Calling station command...')} />
        <Button title="Send update" kind="light" onPress={() => Alert.alert('Update', 'Update sent to command.')} />
        <Text style={[s.grey, { marginTop: 8, fontSize: 12 }]}>Last unit check-in 12:03 · GPS signal strong</Text>
      </Card>
    </View>
  );
}


// ============================================================
// APP (main - decides which screen to show)
// ============================================================
// App.js - the main file. It decides which screen to show.
//   step 1: choose role  ->  step 2: login  ->  step 3: the app with a bottom menu
// No extra libraries needed: we just keep the current screen name in a "state" variable.


// For each role: header badge, bottom menu names, and which screen each name opens.
const ROLES = {
  base: {
    badge: 'BS',
    tabs: ['Dashboard', 'Drone Feeds', 'Alerts', 'Drones', 'History', 'Base station'],
    screens: { Dashboard: BaseDashboard, 'Drone Feeds': DroneFeedsScreen, Alerts: AlertsScreen,
      Drones: DronesScreen, History: HistoryScreen, 'Base station': BaseStationScreen },
  },
  police: {
    badge: 'PS',
    tabs: ['Dashboard', 'Drone Feeds', 'Alerts', 'Drones', 'History', 'Units & stations'],
    // 'Dispatch' is not in the menu - it opens from the Alerts / Dashboard buttons
    screens: { Dashboard: PoliceDashboard, 'Drone Feeds': DroneFeedsScreen, Alerts: AlertsScreen,
      Drones: DronesScreen, History: HistoryScreen, 'Units & stations': UnitsScreen, Dispatch: DispatchScreen },
  },
  field: {
    badge: 'AK',
    tabs: ['My assignment', 'Movement map', 'Risk alerts', 'Radio contact'],
    screens: { 'My assignment': FieldAssignment, 'Movement map': FieldMap,
      'Risk alerts': FieldRisk, 'Radio contact': FieldRadio },
  },
};

function App() {
  const [role, setRole] = useState(null);       // null until a role is chosen
  const [loggedIn, setLoggedIn] = useState(false);
  const [screen, setScreen] = useState('');     // name of the open screen

  let content;
  if (!role) {
    content = <RoleScreen onPick={setRole} />;
  } else if (!loggedIn) {
    content = (
      <LoginScreen role={role} onBack={() => setRole(null)}
        onLogin={() => { setLoggedIn(true); setScreen(ROLES[role].tabs[0]); }} />
    );
  } else {
    const r = ROLES[role];
    const Screen = r.screens[screen];
    content = (
      <View style={{ flex: 1 }}>
        {/* the Home button is hidden when you are already on the first (home) screen of the role */}
        <Header
          badge={r.badge}
          onHome={screen === r.tabs[0] ? null : () => setScreen(r.tabs[0])}
          onLogout={() => { setLoggedIn(false); setRole(null); setScreen(''); }} />
        <ScrollView key={screen}><Screen role={role} go={setScreen} /></ScrollView>
        <TabBar tabs={r.tabs} active={screen === 'Dispatch' ? 'Alerts' : screen} onChange={setScreen} />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar barStyle="dark-content" />
      {/* login / role screens are inside a ScrollView so the keyboard never hides the fields */}
      {loggedIn ? content : <ScrollView keyboardShouldPersistTaps="handled">{content}</ScrollView>}
    </SafeAreaView>
  );
}


export default App;