export type MatchCategory = 'address' | 'pdu' | 'devices';

export interface OsiLayerSpec {
  layerNumber: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  name: string;
  group: 'Upper Layer (Host)' | 'Transport Boundary' | 'Lower Layer (Media)';
  addressType: string;
  addressExample: string;
  addressClue: string;
  pduCanonical: string;
  pduDisplay: string;
  pduExample: string;
  pduClue: string;
  devices: string;
  devicesDetail: string;
  devicesClue: string;
  protocols: string[];
  roleSummary: string;
  accentBg: string;
  accentText: string;
  accentBorder: string;
}

export interface MatchTile {
  id: string;
  category: MatchCategory;
  label: string;
  sublabel: string;
  canonicalKey: string;
  expectedLayer: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  explanation: string;
}

export interface EncapsulationStep {
  id: string;
  phase: 'Encapsulation (Sender)' | 'Network Transit' | 'Decapsulation (Receiver)';
  layerNumber: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  layerName: string;
  activeDevice: string;
  addressUsed: string;
  pduName: string;
  actionTitle: string;
  actionDescription: string;
  headersVisible: Array<'data' | 'l4' | 'l3' | 'l2' | 'bits'>;
  transitNodeIndex: 0 | 1 | 2 | 3 | 4;
}

export const OSI_LAYERS: OsiLayerSpec[] = [
  {
    layerNumber: 7,
    name: 'Application',
    group: 'Upper Layer (Host)',
    addressType: 'URLs & Hostnames (URI / DNS)',
    addressExample: 'https://portal.campus.edu/grades',
    addressClue: 'Human-readable resource names and domain endpoints used by software.',
    pduCanonical: 'Data',
    pduDisplay: 'Data',
    pduExample: 'HTTP GET /grades HTTP/2',
    pduClue: 'Raw upper-layer application payload before transport segmentation.',
    devices: 'Web Proxy & Application Gateway',
    devicesDetail: 'Layer 7 Proxy, WAF, User Workstation Browser',
    devicesClue: 'Inspects HTTP headers, URLs, and application payloads directly.',
    protocols: ['HTTP / HTTPS', 'DNS', 'SMTP', 'SSH', 'FTP'],
    roleSummary: 'Provides network interfaces and protocols directly to end-user software.',
    accentBg: 'bg-sky-50',
    accentText: 'text-sky-800',
    accentBorder: 'border-sky-200',
  },
  {
    layerNumber: 6,
    name: 'Presentation',
    group: 'Upper Layer (Host)',
    addressType: 'Format & Cipher Specs (MIME / TLS)',
    addressExample: 'Content-Type: application/json · TLS 1.3',
    addressClue: 'Identifies character encoding, compression schemes, and encryption ciphers.',
    pduCanonical: 'Data',
    pduDisplay: 'Data',
    pduExample: 'UTF-8 + AES-256-GCM Encrypted Payload',
    pduClue: 'Upper-layer formatted, compressed, or encrypted message payload.',
    devices: 'SSL/TLS Offloader & Codec Engine',
    devicesDetail: 'Hardware TLS Accelerator, Media Transcoder',
    devicesClue: 'Handles encryption/decryption handshakes and syntax translation.',
    protocols: ['TLS / SSL', 'UTF-8', 'JPEG', 'MIME', 'JSON'],
    roleSummary: 'Translates data syntax, compresses payloads, and applies encryption.',
    accentBg: 'bg-indigo-50',
    accentText: 'text-indigo-800',
    accentBorder: 'border-indigo-200',
  },
  {
    layerNumber: 5,
    name: 'Session',
    group: 'Upper Layer (Host)',
    addressType: 'Session IDs & Socket Handles',
    addressExample: 'SID: 0x8F41A2 · Full-Duplex Dialog',
    addressClue: 'Tracks open conversation states, checkpoints, and synchronization tokens.',
    pduCanonical: 'Data',
    pduDisplay: 'Data',
    pduExample: 'Session Token + RPC Dialog Stream',
    pduClue: 'Upper-layer dialog stream maintaining conversation checkpoints.',
    devices: 'Session Border Controller (SBC)',
    devicesDetail: 'Session Border Controller, Stateful Auth Gateway',
    devicesClue: 'Manages, tears down, and recovers ongoing communication dialogs (e.g., VoIP).',
    protocols: ['SIP', 'NetBIOS', 'RPC', 'SMB', 'PPTP'],
    roleSummary: 'Opens, synchronizes, checkpoints, and closes communication sessions.',
    accentBg: 'bg-violet-50',
    accentText: 'text-violet-800',
    accentBorder: 'border-violet-200',
  },
  {
    layerNumber: 4,
    name: 'Transport',
    group: 'Transport Boundary',
    addressType: 'Port Numbers (TCP / UDP)',
    addressExample: 'Src Port 54120 → Dst Port 443',
    addressClue: 'Routes traffic to specific processes or services running on a host.',
    pduCanonical: 'Segment / Datagram',
    pduDisplay: 'Segment (TCP) / Datagram (UDP)',
    pduExample: 'TCP Segment [SYN, Seq=101, Port 443]',
    pduClue: 'Slices upper-layer data into numbered chunks with port headers.',
    devices: 'L4 Load Balancer & Stateful Firewall',
    devicesDetail: 'Layer 4 Load Balancer, Stateful Packet Firewall',
    devicesClue: 'Filters or distributes traffic by TCP/UDP port numbers and connection state.',
    protocols: ['TCP', 'UDP', 'QUIC', 'SCTP'],
    roleSummary: 'Delivers end-to-end process multiplexing, flow control, and error recovery.',
    accentBg: 'bg-teal-50',
    accentText: 'text-teal-800',
    accentBorder: 'border-teal-200',
  },
  {
    layerNumber: 3,
    name: 'Network',
    group: 'Lower Layer (Media)',
    addressType: 'IP Address (Logical IPv4 / IPv6)',
    addressExample: '192.168.10.24 → 93.184.216.34',
    addressClue: 'Hierarchical logical addressing used to route across different networks.',
    pduCanonical: 'Packet',
    pduDisplay: 'Packet',
    pduExample: 'IPv4 Packet [TTL=64, Proto=6, Src/Dst IP]',
    pduClue: 'Encapsulates segments with source and destination logical IP addresses.',
    devices: 'Router & Layer 3 Switch',
    devicesDetail: 'Enterprise Router, Layer 3 Multilayer Switch',
    devicesClue: 'Reads routing tables to forward traffic between separate IP subnets.',
    protocols: ['IPv4', 'IPv6', 'ICMP', 'OSPF', 'BGP'],
    roleSummary: 'Determines best paths and forwards traffic across logical internetworks.',
    accentBg: 'bg-amber-50',
    accentText: 'text-amber-800',
    accentBorder: 'border-amber-200',
  },
  {
    layerNumber: 2,
    name: 'Data Link',
    group: 'Lower Layer (Media)',
    addressType: 'MAC Address (Physical Hardware)',
    addressExample: '00:1A:2B:3C:4D:5E → A4:83:E7:09:1F:20',
    addressClue: '48-bit burned-in hardware address used for hop-to-hop delivery on a LAN.',
    pduCanonical: 'Frame',
    pduDisplay: 'Frame',
    pduExample: '802.3 Ethernet Frame [MACs + Type + FCS]',
    pduClue: 'Adds both a hardware MAC header and a Frame Check Sequence (FCS) trailer.',
    devices: 'Switch, Bridge & NIC',
    devicesDetail: 'Layer 2 Switch, Network Bridge, NIC, Wireless AP',
    devicesClue: 'Builds MAC address tables to forward traffic inside a local broadcast domain.',
    protocols: ['Ethernet (802.3)', 'Wi-Fi (802.11)', 'ARP', '802.1Q VLAN'],
    roleSummary: 'Packages bits into frames for node-to-node delivery and error detection.',
    accentBg: 'bg-orange-50',
    accentText: 'text-orange-800',
    accentBorder: 'border-orange-200',
  },
  {
    layerNumber: 1,
    name: 'Physical',
    group: 'Lower Layer (Media)',
    addressType: 'None — Signaling & Pinouts',
    addressExample: 'RJ45 Pinout · 1000BASE-T · 1310nm Laser',
    addressClue: 'No addressing scheme exists here—only raw voltage, light, or radio frequencies.',
    pduCanonical: 'Bits',
    pduDisplay: 'Bits',
    pduExample: '01001000 01010100 01010100 01010000',
    pduClue: 'Individual binary 1s and 0s encoded as electrical, optical, or RF pulses.',
    devices: 'Hub, Repeater & Cabling',
    devicesDetail: 'Ethernet Hub, Signal Repeater, Media Converter, Cat6/Fiber',
    devicesClue: 'Regenerates or broadcasts raw electrical/optical signals with zero address logic.',
    protocols: ['1000BASE-T', 'Fiber Optic', 'DSL', 'Bluetooth PHY'],
    roleSummary: 'Transmits and receives raw unstructured bitstreams over physical media.',
    accentBg: 'bg-slate-100',
    accentText: 'text-slate-800',
    accentBorder: 'border-slate-300',
  },
];

export function buildMatchTiles(): MatchTile[] {
  const tiles: MatchTile[] = [];

  for (const layer of OSI_LAYERS) {
    tiles.push({
      id: `addr-l${layer.layerNumber}`,
      category: 'address',
      label: layer.addressType,
      sublabel: layer.addressExample,
      canonicalKey: `addr-${layer.layerNumber}`,
      expectedLayer: layer.layerNumber,
      explanation: `${layer.addressType} belongs to Layer ${layer.layerNumber} (${layer.name}): ${layer.addressClue}`,
    });

    tiles.push({
      id: `pdu-l${layer.layerNumber}`,
      category: 'pdu',
      label: layer.pduDisplay,
      sublabel:
        layer.pduCanonical === 'Data'
          ? 'Upper-layer payload (L5–L7)'
          : `Layer ${layer.layerNumber} encapsulation unit`,
      canonicalKey: layer.pduCanonical,
      expectedLayer: layer.layerNumber,
      explanation:
        layer.pduCanonical === 'Data'
          ? `Layers 5, 6, and 7 all pass Data as their Protocol Data Unit (PDU).`
          : `${layer.pduDisplay} is the PDU at Layer ${layer.layerNumber} (${layer.name}): ${layer.pduClue}`,
    });

    tiles.push({
      id: `dev-l${layer.layerNumber}`,
      category: 'devices',
      label: layer.devices,
      sublabel: layer.devicesDetail,
      canonicalKey: `dev-${layer.layerNumber}`,
      expectedLayer: layer.layerNumber,
      explanation: `${layer.devices} operates at Layer ${layer.layerNumber} (${layer.name}): ${layer.devicesClue}`,
    });
  }

  return tiles;
}

export function isTileCorrectForSlot(
  tile: MatchTile,
  targetLayer: 1 | 2 | 3 | 4 | 5 | 6 | 7,
  targetCategory: MatchCategory
): boolean {
  if (tile.category !== targetCategory) {
    return false;
  }
  const layerSpec = OSI_LAYERS.find((l) => l.layerNumber === targetLayer);
  if (!layerSpec) return false;

  if (targetCategory === 'pdu') {
    return tile.canonicalKey === layerSpec.pduCanonical;
  }
  return tile.expectedLayer === targetLayer;
}

export const ENCAPSULATION_STEPS: EncapsulationStep[] = [
  {
    id: 'step-l7',
    phase: 'Encapsulation (Sender)',
    layerNumber: 7,
    layerName: 'Application',
    activeDevice: 'Workstation Browser',
    addressUsed: 'https://portal.campus.edu/grades',
    pduName: 'Data',
    actionTitle: 'L7: Create Application Message',
    actionDescription:
      'Your browser resolves the URL hostname via DNS and formats an HTTP GET request payload.',
    headersVisible: ['data'],
    transitNodeIndex: 0,
  },
  {
    id: 'step-l6',
    phase: 'Encapsulation (Sender)',
    layerNumber: 6,
    layerName: 'Presentation',
    activeDevice: 'TLS / Codec Engine',
    addressUsed: 'TLS 1.3 Cipher + UTF-8',
    pduName: 'Data',
    actionTitle: 'L6: Encode & Encrypt Data',
    actionDescription:
      'The message is encoded into UTF-8 bytes and encrypted with AES-256-GCM under TLS.',
    headersVisible: ['data'],
    transitNodeIndex: 0,
  },
  {
    id: 'step-l5',
    phase: 'Encapsulation (Sender)',
    layerNumber: 5,
    layerName: 'Session',
    activeDevice: 'OS Socket Manager',
    addressUsed: 'Session ID 0x8F41A2',
    pduName: 'Data',
    actionTitle: 'L5: Bind Session Dialog',
    actionDescription:
      'A session socket tracks the active request-response dialog and checkpoint state.',
    headersVisible: ['data'],
    transitNodeIndex: 0,
  },
  {
    id: 'step-l4',
    phase: 'Encapsulation (Sender)',
    layerNumber: 4,
    layerName: 'Transport',
    activeDevice: 'TCP Stack (Host OS)',
    addressUsed: 'Src Port 54120 → Dst Port 443',
    pduName: 'Segment (TCP)',
    actionTitle: 'L4: Segment & Stamp Port Header',
    actionDescription:
      'Transport slices the Data and prepends TCP Port 443 + sequence numbers, creating a Segment.',
    headersVisible: ['l4', 'data'],
    transitNodeIndex: 0,
  },
  {
    id: 'step-l3',
    phase: 'Encapsulation (Sender)',
    layerNumber: 3,
    layerName: 'Network',
    activeDevice: 'Host IP Stack',
    addressUsed: '192.168.10.24 → 93.184.216.34',
    pduName: 'Packet',
    actionTitle: 'L3: Add Logical IP Header',
    actionDescription:
      'Network wraps the Segment with Source and Destination IPv4 addresses, creating a Packet.',
    headersVisible: ['l3', 'l4', 'data'],
    transitNodeIndex: 0,
  },
  {
    id: 'step-l2',
    phase: 'Encapsulation (Sender)',
    layerNumber: 2,
    layerName: 'Data Link',
    activeDevice: 'Network Interface Card (NIC)',
    addressUsed: '00:1A:2B:3C:4D:5E → Router MAC',
    pduName: 'Frame',
    actionTitle: 'L2: Frame with MAC & FCS Trailer',
    actionDescription:
      'The NIC adds local hop MAC addresses and a Frame Check Sequence trailer, creating a Frame.',
    headersVisible: ['l2', 'l3', 'l4', 'data'],
    transitNodeIndex: 0,
  },
  {
    id: 'step-l1',
    phase: 'Encapsulation (Sender)',
    layerNumber: 1,
    layerName: 'Physical',
    activeDevice: 'Cat6 Patch Cable / Transceiver',
    addressUsed: 'None (1000BASE-T Voltages)',
    pduName: 'Bits',
    actionTitle: 'L1: Serialize Frame into Raw Bits',
    actionDescription:
      'The Frame is converted into electrical pulses (or light) on the copper/fiber medium.',
    headersVisible: ['bits'],
    transitNodeIndex: 0,
  },
  {
    id: 'step-switch',
    phase: 'Network Transit',
    layerNumber: 2,
    layerName: 'Data Link',
    activeDevice: 'Layer 2 Switch',
    addressUsed: 'MAC Table Lookup',
    pduName: 'Frame',
    actionTitle: 'Switch Forwards Frame by MAC',
    actionDescription:
      'The LAN switch reconstructs the bits into a Frame, reads the destination MAC, and forwards it toward the default gateway.',
    headersVisible: ['l2', 'l3', 'l4', 'data'],
    transitNodeIndex: 1,
  },
  {
    id: 'step-router',
    phase: 'Network Transit',
    layerNumber: 3,
    layerName: 'Network',
    activeDevice: 'Enterprise Router',
    addressUsed: 'Routing Table (Dst IP 93.184.216.34)',
    pduName: 'Packet',
    actionTitle: 'Router Routes Packet by IP',
    actionDescription:
      'The router strips the old L2 Frame, inspects the L3 IP Packet, decrements TTL, and re-frames it for the WAN hop.',
    headersVisible: ['l3', 'l4', 'data'],
    transitNodeIndex: 2,
  },
  {
    id: 'step-fw',
    phase: 'Network Transit',
    layerNumber: 4,
    layerName: 'Transport',
    activeDevice: 'Stateful Firewall',
    addressUsed: 'Allow TCP Port 443 (HTTPS)',
    pduName: 'Segment (TCP)',
    actionTitle: 'Firewall Inspects Port 443 State',
    actionDescription:
      'The edge stateful firewall verifies the TCP Port 443 rule and active session table before admitting traffic.',
    headersVisible: ['l4', 'data'],
    transitNodeIndex: 3,
  },
  {
    id: 'step-rx-l7',
    phase: 'Decapsulation (Receiver)',
    layerNumber: 7,
    layerName: 'Application',
    activeDevice: 'Web Server (nginx / App)',
    addressUsed: 'https://portal.campus.edu/grades',
    pduName: 'Data',
    actionTitle: 'Server Receives Decapsulated Data',
    actionDescription:
      'The destination server strips L2→L4 headers, decrypts TLS at L6, and delivers the clean HTTP GET Data to the web app.',
    headersVisible: ['data'],
    transitNodeIndex: 4,
  },
];

export interface OsiScenario {
  id: string;
  layerNumber: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  category: 'Addressing' | 'PDU & Framing' | 'Devices' | 'Troubleshooting';
  prompt: string;
  clue: string;
  explanation: string;
  addressHighlight: string;
  pduHighlight: string;
  deviceHighlight: string;
}

export const OSI_SCENARIOS: OsiScenario[] = [
  {
    id: 'sc-l7-1',
    layerNumber: 7,
    category: 'Troubleshooting',
    prompt:
      'A Web Application Firewall (WAF) inspects incoming HTTP POST URLs and JSON form fields to block a SQL injection attempt before it reaches the backend app.',
    clue: 'This device understands full URLs, HTTP verbs, and end-user application payloads.',
    explanation:
      'Layer 7 (Application) devices such as WAFs and web proxies inspect application-level protocols (HTTP/HTTPS), URLs, and raw user Data.',
    addressHighlight: 'URLs & Hostnames (URI)',
    pduHighlight: 'Data',
    deviceHighlight: 'Web Proxy & Application Gateway (WAF)',
  },
  {
    id: 'sc-l7-2',
    layerNumber: 7,
    category: 'Addressing',
    prompt:
      'A student types https://library.university.edu/catalog into a browser, initiating a DNS hostname lookup and an HTTP GET request.',
    clue: 'User-facing domain names and resource paths operate at the top of the OSI stack.',
    explanation:
      'Layer 7 (Application) interfaces directly with user software using hostnames, URIs, and protocols like HTTP and DNS.',
    addressHighlight: 'URLs & Hostnames (URI / DNS)',
    pduHighlight: 'Data',
    deviceHighlight: 'User Workstation Browser',
  },
  {
    id: 'sc-l7-3',
    layerNumber: 7,
    category: 'Devices',
    prompt:
      'An email server uses SMTP commands to relay an outbound message from a mail client to a corporate mail gateway.',
    clue: 'SMTP, POP3, IMAP, and HTTP all provide services directly to end-user applications.',
    explanation:
      'SMTP is a Layer 7 (Application) protocol exchanging user message Data between mail applications.',
    addressHighlight: 'Mail Domain / Hostname',
    pduHighlight: 'Data',
    deviceHighlight: 'Application Gateway / Mail Relay',
  },
  {
    id: 'sc-l6-1',
    layerNumber: 6,
    category: 'Devices',
    prompt:
      'A dedicated SSL/TLS hardware offloader decrypts AES-256-GCM traffic and verifies the TLS 1.3 cipher suite before passing plain UTF-8 text upstream.',
    clue: 'Encryption, compression, and character-encoding syntax translation happen just below Application.',
    explanation:
      'Layer 6 (Presentation) handles encryption/decryption (TLS/SSL), data compression, and syntax formats such as UTF-8 and JSON.',
    addressHighlight: 'Format & Cipher Specs (TLS / MIME)',
    pduHighlight: 'Data',
    deviceHighlight: 'SSL/TLS Offloader & Codec Engine',
  },
  {
    id: 'sc-l6-2',
    layerNumber: 6,
    category: 'Troubleshooting',
    prompt:
      'A legacy mainframe exports EBCDIC text that appears garbled until a gateway translates the character encoding into standard ASCII/UTF-8.',
    clue: 'Translating between incompatible data representations is the core job of this upper layer.',
    explanation:
      'Layer 6 (Presentation) acts as the translator of the OSI model, converting character sets (EBCDIC, ASCII, UTF-8) and media formats (JPEG, MIME).',
    addressHighlight: 'Data Format & Encoding Identifiers',
    pduHighlight: 'Data',
    deviceHighlight: 'Codec / Translation Engine',
  },
  {
    id: 'sc-l6-3',
    layerNumber: 6,
    category: 'PDU & Framing',
    prompt:
      'An API server compresses a large XML response with gzip so it consumes less bandwidth before transport segmentation begins.',
    clue: 'Compression and encryption prepare the formatted Data payload right before session and transport handling.',
    explanation:
      'Layer 6 (Presentation) compresses and formats upper-layer Data before passing it down.',
    addressHighlight: 'Content-Encoding / MIME Type',
    pduHighlight: 'Data',
    deviceHighlight: 'Compression / Codec Engine',
  },
  {
    id: 'sc-l5-1',
    layerNumber: 5,
    category: 'Devices',
    prompt:
      'A Session Border Controller (SBC) initiates, tracks, and cleanly tears down a full-duplex VoIP call dialog using SIP signaling.',
    clue: 'Managing ongoing communication dialogs between two hosts belongs to the lowest of the three upper layers.',
    explanation:
      'Layer 5 (Session) establishes, maintains, and terminates communication dialogs using protocols like SIP, NetBIOS, and RPC.',
    addressHighlight: 'Session IDs & Socket Handles',
    pduHighlight: 'Data',
    deviceHighlight: 'Session Border Controller (SBC)',
  },
  {
    id: 'sc-l5-2',
    layerNumber: 5,
    category: 'Troubleshooting',
    prompt:
      'During a large remote procedure call (RPC) file transfer, a brief interruption occurs and the connection resumes from its last synchronization checkpoint.',
    clue: 'Checkpointing and dialog recovery between applications are managed here.',
    explanation:
      'Layer 5 (Session) inserts synchronization checkpoints into dialog streams so interrupted sessions can resume cleanly.',
    addressHighlight: 'Session IDs & Checkpoint Tokens',
    pduHighlight: 'Data',
    deviceHighlight: 'Stateful Session Gateway',
  },
  {
    id: 'sc-l5-3',
    layerNumber: 5,
    category: 'Addressing',
    prompt:
      'An authentication service assigns unique Session IDs and socket descriptors so multiple browser tabs keep separate stateful conversations.',
    clue: 'This layer binds and isolates conversation state using Session IDs.',
    explanation:
      'Layer 5 (Session) tracks individual host-to-host conversation states via Session IDs and socket handles.',
    addressHighlight: 'Session IDs & Socket Handles',
    pduHighlight: 'Data',
    deviceHighlight: 'Stateful Auth / Session Gateway',
  },
  {
    id: 'sc-l4-1',
    layerNumber: 4,
    category: 'Addressing',
    prompt:
      'A stateful firewall permits outbound traffic destined for TCP Port 443 while dropping unsolicited inbound connections to TCP Port 22.',
    clue: 'TCP and UDP port numbers identify specific processes and services on a host.',
    explanation:
      'Layer 4 (Transport) uses TCP and UDP port numbers to multiplex services and control end-to-end delivery via stateful firewalls and L4 load balancers.',
    addressHighlight: 'Port Numbers (TCP / UDP)',
    pduHighlight: 'Segment / Datagram',
    deviceHighlight: 'Stateful Firewall & L4 Load Balancer',
  },
  {
    id: 'sc-l4-2',
    layerNumber: 4,
    category: 'PDU & Framing',
    prompt:
      'A sending host slices a 12 MB download into numbered TCP Segments and retransmits Segment #148 after no acknowledgment arrives.',
    clue: 'Segmentation, sequence numbers, and reliable acknowledgment happen at the Transport boundary.',
    explanation:
      'Layer 4 (Transport) breaks Data into TCP Segments (or UDP Datagrams) and handles reliability and flow control.',
    addressHighlight: 'Port Numbers (TCP / UDP)',
    pduHighlight: 'Segment (TCP) / Datagram (UDP)',
    deviceHighlight: 'L4 Load Balancer & Stateful Firewall',
  },
  {
    id: 'sc-l4-3',
    layerNumber: 4,
    category: 'Devices',
    prompt:
      'A Layer 4 load balancer distributes incoming UDP Port 53 queries evenly across four backend DNS servers without inspecting DNS names.',
    clue: 'Routing traffic strictly by TCP/UDP port and connection state occurs here.',
    explanation:
      'Layer 4 (Transport) load balancers forward Segments/Datagrams based on IP + Port tuples without inspecting Layer 7 payloads.',
    addressHighlight: 'Port Numbers (UDP :53)',
    pduHighlight: 'Datagram (UDP)',
    deviceHighlight: 'Layer 4 Load Balancer',
  },
  {
    id: 'sc-l3-1',
    layerNumber: 3,
    category: 'Devices',
    prompt:
      'An enterprise router examines the destination IPv4 address 172.16.40.9, decrements the TTL field, and forwards the traffic out its WAN interface.',
    clue: 'Logical IP addressing and best-path selection across subnets belong to this layer.',
    explanation:
      'Layer 3 (Network) routers inspect logical IP addresses and routing tables to forward Packets across interconnected networks.',
    addressHighlight: 'IP Address (Logical IPv4 / IPv6)',
    pduHighlight: 'Packet',
    deviceHighlight: 'Router & Layer 3 Switch',
  },
  {
    id: 'sc-l3-2',
    layerNumber: 3,
    category: 'Troubleshooting',
    prompt:
      'A network engineer runs traceroute and receives ICMP Time Exceeded replies from each intermediate gateway between two branch offices.',
    clue: 'ICMP diagnostics and TTL expiration happen on logical Packets.',
    explanation:
      'ICMP operates at Layer 3 (Network), reporting reachability and TTL exhaustion for IP Packets across routers.',
    addressHighlight: 'IP Address (Logical IPv4 / IPv6)',
    pduHighlight: 'Packet',
    deviceHighlight: 'Router',
  },
  {
    id: 'sc-l3-3',
    layerNumber: 3,
    category: 'PDU & Framing',
    prompt:
      'Two campus buildings exchange OSPF link-state updates so their Layer 3 switches know the shortest path for IPv6 Packets.',
    clue: 'Dynamic routing protocols calculate paths for Packets using logical IP prefixes.',
    explanation:
      'Layer 3 (Network) handles logical addressing (IPv4/IPv6) and dynamic routing protocols (OSPF, BGP) for Packets.',
    addressHighlight: 'IP Address (IPv6)',
    pduHighlight: 'Packet',
    deviceHighlight: 'Layer 3 Switch & Router',
  },
  {
    id: 'sc-l2-1',
    layerNumber: 2,
    category: 'Devices',
    prompt:
      'An Ethernet switch looks up destination MAC address A4:83:E7:09:1F:20 in its CAM table and forwards the Frame solely out port 18.',
    clue: '48-bit physical hardware addresses and local-LAN Frame forwarding happen one step above cabling.',
    explanation:
      'Layer 2 (Data Link) switches forward Ethernet Frames inside a local network using burned-in physical MAC addresses.',
    addressHighlight: 'MAC Address (Physical Hardware)',
    pduHighlight: 'Frame',
    deviceHighlight: 'Switch, Bridge & NIC',
  },
  {
    id: 'sc-l2-2',
    layerNumber: 2,
    category: 'PDU & Framing',
    prompt:
      'A Network Interface Card (NIC) recalculates the Frame Check Sequence (FCS) CRC-32 trailer and discards a corrupted Ethernet Frame.',
    clue: 'Error detection via the FCS trailer is part of encapsulating data into Frames.',
    explanation:
      'Layer 2 (Data Link) adds a MAC header and an FCS trailer to detect bit errors on local hop Frames.',
    addressHighlight: 'MAC Address (Physical Hardware)',
    pduHighlight: 'Frame',
    deviceHighlight: 'Network Interface Card (NIC)',
  },
  {
    id: 'sc-l2-3',
    layerNumber: 2,
    category: 'Addressing',
    prompt:
      'An 802.1Q VLAN tag is added to traffic leaving a wireless access point so student and staff LAN segments remain isolated.',
    clue: 'VLAN tagging, ARP resolution, and MAC addresses live at the Data Link boundary.',
    explanation:
      'Layer 2 (Data Link) manages local medium access control, 802.1Q VLAN tagging, Wi-Fi (802.11), and MAC addressing.',
    addressHighlight: 'MAC Address (48-bit Hardware)',
    pduHighlight: 'Frame',
    deviceHighlight: 'Wireless AP & Switch',
  },
  {
    id: 'sc-l1-1',
    layerNumber: 1,
    category: 'Troubleshooting',
    prompt:
      'A technician tests a Cat6 patch cable with a wiremap tester and discovers pins 3 and 6 are crossed, preventing a link light on the port.',
    clue: 'Pinouts, copper pairs, and raw link voltages have no MAC or IP addressing.',
    explanation:
      'Layer 1 (Physical) covers physical cabling, RJ45 pinouts, connectors, and electrical/optical signaling of raw Bits.',
    addressHighlight: 'None — Signaling & Pinouts',
    pduHighlight: 'Bits',
    deviceHighlight: 'Cat6 Cabling & Media Converter',
  },
  {
    id: 'sc-l1-2',
    layerNumber: 1,
    category: 'Devices',
    prompt:
      'A legacy Ethernet hub receives an electrical pulse on port 1 and immediately repeats those raw binary voltage transitions out all other ports.',
    clue: 'Hubs and repeaters amplify signals blindly without reading MAC addresses or Frames.',
    explanation:
      'Layer 1 (Physical) hubs and repeaters operate purely on electrical, optical, or radio Bits with zero addressing logic.',
    addressHighlight: 'None — Raw Signal',
    pduHighlight: 'Bits',
    deviceHighlight: 'Hub & Signal Repeater',
  },
  {
    id: 'sc-l1-3',
    layerNumber: 1,
    category: 'PDU & Framing',
    prompt:
      'Single-mode fiber transceivers modulate a 1310nm laser beam to carry an unstructured stream of binary 1s and 0s across campus.',
    clue: 'Light pulses, radio frequencies, and raw binary streams represent the foundational PDU.',
    explanation:
      'Layer 1 (Physical) converts Frames into physical Bits transmitted as electrical voltage, laser light, or RF waves.',
    addressHighlight: 'None — Optical Wavelength',
    pduHighlight: 'Bits',
    deviceHighlight: 'Fiber Transceiver & Media Converter',
  },
];

