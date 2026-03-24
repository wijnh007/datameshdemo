// DataMesh Platform — TM Forum Telco Data Products
// Reference standards: TM Forum SID, TMF Open APIs, 3GPP, GSMA
const DataMesh = (() => {

  const DOMAIN_COLORS = {
    Subscriber:  '#3b82f6',   // blue
    Product:     '#14b8a6',   // teal
    Service:     '#22c55e',   // green
    Network:     '#f59e0b',   // amber
    Analytics:   '#a855f7',   // violet
    Finance:     '#06b6d4',   // cyan
    Partner:     '#ec4899',   // pink
    Operations:  '#84cc16',   // lime
  };

  const PORT_TYPE_COLORS = {
    api:       '#3b82f6',
    streaming: '#22c55e',
    batch:     '#f59e0b',
    database:  '#a855f7',
    event:     '#14b8a6',
  };

  // ─────────────────────────────────────────────────────────────
  // 83 TM Forum–aligned Telco Data Products
  // Original layout: 5 layers (x = 80 / 580 / 1080 / 1580 / 2080)
  // Extended layout: 8 domain columns (x = 2580–6080)
  // ─────────────────────────────────────────────────────────────
  const initialProducts = [

    // ── LAYER 1 – Foundation / Master Data ────────────────────

    {
      id: 'dp-001', name: 'Subscriber Master Data',
      domain: 'Subscriber', owner: 'BSS Data Office',
      version: '3.2.1', status: 'active',
      sla: '99.99%', updateFrequency: 'Real-time',
      accessTier: 'standard',
      tags: ['subscriber', 'party', 'TMF680', 'SID', 'gdpr'],
      description: 'Canonical subscriber record based on TM Forum SID Party/Customer model (TMF680). Single source of truth for MSISDN, IMSI, account status, tariff plan, and KYC attributes. Feeds all downstream customer-facing products.',
      inputPorts: [
        { id: 'ip-001-1', name: 'BSS/CRM System',        type: 'batch',     format: 'CSV',      description: 'Nightly full-load from customer care BSS' },
        { id: 'ip-001-2', name: 'OSS Subscriber Registry',type: 'streaming', format: 'JSON',     description: 'HLR/HSS provisioning events via Kafka' },
        { id: 'ip-001-3', name: 'Identity & KYC System',  type: 'api',       format: 'REST',     description: 'eKYC verification and identity attributes' },
      ],
      outputPorts: [
        { id: 'op-001-1', name: 'Subscriber Profile API',       type: 'api',       format: 'REST/JSON', description: 'TMF680 Party API — enriched subscriber profiles' },
        { id: 'op-001-2', name: 'Subscriber Lifecycle Events',  type: 'streaming', format: 'Avro',      description: 'Kafka topic: activations, deactivations, plan changes' },
      ],
      x: 80, y: 80,
    },

    {
      id: 'dp-002', name: 'Product Catalog',
      domain: 'Product', owner: 'Product Management',
      version: '2.0.4', status: 'active',
      sla: '99.9%', updateFrequency: 'Near real-time',
      accessTier: 'free',
      tags: ['product', 'TMF620', 'catalog', 'offer', 'specification'],
      description: 'TM Forum TMF620-compliant product catalog covering ProductSpecification, ProductOffering, and PricingPlan. Master reference for all tariff plans, bundles, VAS offerings, and roaming add-ons.',
      inputPorts: [
        { id: 'ip-002-1', name: 'Product Config System',  type: 'api',   format: 'REST', description: 'Product lifecycle management tool (Amdocs/Sigma)' },
        { id: 'ip-002-2', name: 'Marketing Offer Tool',   type: 'batch', format: 'XML',  description: 'Campaign and promotions feed from marketing' },
      ],
      outputPorts: [
        { id: 'op-002-1', name: 'Product Catalog API (TMF620)', type: 'api',       format: 'REST/JSON', description: 'TMF620 Product Catalog Management REST API' },
        { id: 'op-002-2', name: 'Product Specification Events', type: 'streaming', format: 'JSON',      description: 'Kafka stream of catalog create/update/delete events' },
      ],
      x: 80, y: 390,
    },

    {
      id: 'dp-003', name: 'Network Resource Inventory',
      domain: 'Network', owner: 'Network OSS Team',
      version: '1.5.0', status: 'active',
      sla: '99.5%', updateFrequency: 'Every 15 min',
      accessTier: 'standard',
      tags: ['resource', 'TMF639', 'inventory', 'topology', 'OSS', 'CMDB'],
      description: 'TM Forum TMF639 Resource Inventory covering physical and logical network assets: RAN sites, transmission links, core nodes, IP addresses, and MSISDN/IMSI blocks. Authoritative topology source for OSS/BSS integration.',
      inputPorts: [
        { id: 'ip-003-1', name: 'OSS/NMS Network Discovery', type: 'batch',     format: 'YANG/XML', description: 'Periodic topology sync from Nokia NSP / Ericsson ENM' },
        { id: 'ip-003-2', name: 'CMDB System',               type: 'api',       format: 'REST',     description: 'Physical asset register (ServiceNow CMDB)' },
        { id: 'ip-003-3', name: 'GIS / Site Registry',       type: 'batch',     format: 'GeoJSON',  description: 'Cell tower and cabinet geographic coordinates' },
      ],
      outputPorts: [
        { id: 'op-003-1', name: 'Resource Inventory API (TMF639)', type: 'api',       format: 'REST/JSON', description: 'TMF639 logical and physical resource queries' },
        { id: 'op-003-2', name: 'Network Topology Feed',           type: 'streaming', format: 'JSON',      description: 'Real-time topology change events (node up/down, re-config)' },
        { id: 'op-003-3', name: 'Physical Asset Export',           type: 'batch',     format: 'CSV',       description: 'Weekly full dump of site and equipment register' },
      ],
      x: 80, y: 700,
    },

    {
      id: 'dp-004', name: 'Usage Records & CDR Data',
      domain: 'Network', owner: 'Mediation & Billing Ops',
      version: '4.1.2', status: 'active',
      sla: '99.95%', updateFrequency: 'Real-time',
      accessTier: 'premium',
      tags: ['CDR', 'usage', 'mediation', '3GPP', 'xDR', 'charging'],
      description: 'Normalised call/session detail records from the mediation platform covering voice (MOC/MTC), SMS, and data bearers across 2G/3G/4G/5G. Conforms to 3GPP TS 32.297 CDR format with operator-specific extensions. Basis for all charging, fraud, and analytics use cases.',
      inputPorts: [
        { id: 'ip-004-1', name: 'Mediation Platform',           type: 'streaming', format: 'ASN.1',   description: 'Raw xDRs from Huawei/Ericsson/Nokia mediation' },
        { id: 'ip-004-2', name: '5G Policy Control (PCF)',      type: 'streaming', format: 'JSON',    description: 'Online charging and policy events from 5GC PCF' },
        { id: 'ip-004-3', name: 'VoLTE Billing Feed',           type: 'streaming', format: 'ASN.1',   description: 'IMS charging data records from P-CSCF/S-CSCF' },
      ],
      outputPorts: [
        { id: 'op-004-1', name: 'Normalised CDR Stream',  type: 'streaming', format: 'Avro',    description: 'Enriched, decoded CDRs on Kafka (sub-minute latency)' },
        { id: 'op-004-2', name: 'Aggregated Usage Batch', type: 'batch',     format: 'Parquet', description: 'Hourly/daily subscriber usage summaries in data lake' },
        { id: 'op-004-3', name: 'Rated Usage Records',    type: 'streaming', format: 'Avro',    description: 'Real-time rated CDRs post online-charging enrichment' },
      ],
      x: 80, y: 1010,
    },

    // ── LAYER 2 – Operational Data Products ───────────────────

    {
      id: 'dp-005', name: 'Customer Account & Billing Profile',
      domain: 'Finance', owner: 'Billing Domain Team',
      version: '2.3.0', status: 'active',
      sla: '99.9%', updateFrequency: 'Near real-time',
      accessTier: 'standard',
      tags: ['billing', 'account', 'TMF666', 'TMF678', 'invoice', 'SID'],
      description: 'Unified customer financial profile based on TMF666 (Account Management) and TMF678 (Customer Bill Management). Consolidates billing account, contract terms, payment method, credit limit, outstanding balances, and invoice history.',
      inputPorts: [
        { id: 'ip-005-1', name: 'Billing System (Amdocs/CSG)', type: 'batch',     format: 'CSV',      description: 'Nightly billing cycle output — charges, adjustments' },
        { id: 'ip-005-2', name: 'Subscriber Profile API',       type: 'api',       format: 'REST',     description: 'Customer identity from Subscriber Master (TMF680)' },
      ],
      outputPorts: [
        { id: 'op-005-1', name: 'Account & Billing API (TMF666)', type: 'api',       format: 'REST/JSON', description: 'TMF666 account details: balance, contract, payment method' },
        { id: 'op-005-2', name: 'Invoice Data Feed',               type: 'streaming', format: 'JSON',      description: 'Real-time invoice creation / payment events' },
        { id: 'op-005-3', name: 'Payment History Batch',           type: 'batch',     format: 'Parquet',   description: 'Monthly payment ledger for revenue analytics' },
      ],
      x: 580, y: 80,
    },

    {
      id: 'dp-006', name: 'Product Inventory',
      domain: 'Product', owner: 'Product Data Team',
      version: '1.8.1', status: 'active',
      sla: '99.9%', updateFrequency: 'Real-time',
      accessTier: 'standard',
      tags: ['product', 'inventory', 'TMF637', 'subscription', 'SID'],
      description: 'TM Forum TMF637 Product Inventory — the authoritative list of instantiated product offerings per subscriber. Tracks active tariff plans, add-ons, SIM status, and contract end-dates. Drives provisioning, billing, and analytics pipelines.',
      inputPorts: [
        { id: 'ip-006-1', name: 'Order Management System',      type: 'api',       format: 'REST',  description: 'Product order fulfilment events (TMF622)' },
        { id: 'ip-006-2', name: 'Product Catalog API (TMF620)', type: 'api',       format: 'REST',  description: 'Offering spec lookup for inventory enrichment' },
        { id: 'ip-006-3', name: 'Provisioning Confirmation',    type: 'streaming', format: 'JSON',  description: 'Activation ACKs from OSS provisioning platform' },
      ],
      outputPorts: [
        { id: 'op-006-1', name: 'Product Inventory API (TMF637)', type: 'api',       format: 'REST/JSON', description: 'Current product instances per subscriber / account' },
        { id: 'op-006-2', name: 'Active Subscription Events',     type: 'streaming', format: 'Avro',      description: 'Kafka stream of activations, upgrades, terminations' },
      ],
      x: 580, y: 390,
    },

    {
      id: 'dp-007', name: 'Service Inventory',
      domain: 'Service', owner: 'Service Assurance Team',
      version: '1.4.3', status: 'active',
      sla: '99.5%', updateFrequency: 'Real-time',
      accessTier: 'standard',
      tags: ['service', 'inventory', 'TMF638', 'SID', 'provisioning'],
      description: 'TM Forum TMF638 Service Inventory containing all instantiated service instances: mobile data APNs, voice bearers, VPN services, IoT connectivity, and fixed broadband lines. Maps services to the underlying network resources (TMF639) and upward to product offerings (TMF637).',
      inputPorts: [
        { id: 'ip-007-1', name: 'Service Activation Platform',    type: 'api',       format: 'REST', description: 'EPC/5GC activation confirmation events' },
        { id: 'ip-007-2', name: 'Resource Inventory API (TMF639)', type: 'api',       format: 'REST', description: 'Underlying network resource assignments' },
        { id: 'ip-007-3', name: 'Product Inventory API (TMF637)', type: 'api',       format: 'REST', description: 'Parent product offering for each service instance' },
      ],
      outputPorts: [
        { id: 'op-007-1', name: 'Service Inventory API (TMF638)', type: 'api',       format: 'REST/JSON', description: 'TMF638 service instance queries with resource mapping' },
        { id: 'op-007-2', name: 'Service Status Event Stream',    type: 'streaming', format: 'JSON',      description: 'Kafka topic: service state changes (active/suspended/terminated)' },
        { id: 'op-007-3', name: 'Service Topology Export',        type: 'batch',     format: 'JSON',      description: 'Daily E2E service-to-resource topology snapshot' },
      ],
      x: 580, y: 700,
    },

    {
      id: 'dp-008', name: 'Network Performance & KPI Data',
      domain: 'Network', owner: 'Network Analytics Team',
      version: '3.0.0', status: 'active',
      sla: '99.0%', updateFrequency: 'Every 15 min',
      accessTier: 'standard',
      tags: ['performance', 'KPI', 'PM', '3GPP', '5G', 'RAN', 'core', 'TS28552'],
      description: 'Consolidated network performance measurement data conforming to 3GPP TS 28.552 (5G NR KPIs) and TS 32.401/32.404. Covers RAN (eNB/gNB cell KPIs), EPC/5GC core (AMF, SMF, UPF counters), transport (IP/MPLS latency), and virtualised NFs (VNF CPU/memory).',
      inputPorts: [
        { id: 'ip-008-1', name: 'RAN PM Collectors',      type: 'batch',     format: 'XML/CSV',  description: '15-min PM files from eNB/gNB via SFTP/FTP push' },
        { id: 'ip-008-2', name: 'Core Network PM Files',  type: 'batch',     format: 'XML',      description: 'AMF/SMF/UPF/PGW measurement files' },
        { id: 'ip-008-3', name: 'Cloud / VNF Metrics',    type: 'streaming', format: 'JSON',     description: 'Prometheus/OpenMetrics from virtualised NFs via Kafka' },
      ],
      outputPorts: [
        { id: 'op-008-1', name: 'Network KPI API',        type: 'api',       format: 'REST/JSON', description: 'On-demand cell, site, and node KPI queries' },
        { id: 'op-008-2', name: 'Raw Performance Stream', type: 'streaming', format: 'Avro',      description: 'Normalised 15-min KPIs on Kafka (low latency)' },
        { id: 'op-008-3', name: 'Aggregated KPI Batch',   type: 'batch',     format: 'Parquet',   description: 'Hourly/daily KPI aggregates stored in data lake' },
      ],
      x: 580, y: 1010,
    },

    {
      id: 'dp-009', name: 'Alarm & Event Management',
      domain: 'Network', owner: 'NOC / Network Operations',
      version: '2.1.0', status: 'active',
      sla: '99.99%', updateFrequency: 'Real-time',
      accessTier: 'standard',
      tags: ['alarm', 'fault', 'TMF642', 'ITU-T', 'X.733', 'OSS', 'NOC'],
      description: 'Centralised alarm and event correlation platform implementing TMF642 Alarm Management API and ITU-T X.733 alarm severity model. Aggregates SNMP traps, YANG notifications, and cloud alerts from all network domains, applies deduplication and root-cause correlation.',
      inputPorts: [
        { id: 'ip-009-1', name: 'Network Element Alarms (SNMP)', type: 'streaming', format: 'SNMP',   description: 'SNMP v2/v3 traps from RAN and core NEs' },
        { id: 'ip-009-2', name: 'OSS Alarm Manager',             type: 'api',       format: 'REST',   description: 'Consolidated alarm feed from Netcracker/IBM Tivoli' },
        { id: 'ip-009-3', name: 'Cloud Alert Manager',           type: 'streaming', format: 'JSON',   description: 'Prometheus AlertManager webhooks for VNF alerts' },
      ],
      outputPorts: [
        { id: 'op-009-1', name: 'Active Alarm API (TMF642)', type: 'api',       format: 'REST/JSON', description: 'TMF642 Alarm Management — current active alarms' },
        { id: 'op-009-2', name: 'Alarm Event Stream',        type: 'streaming', format: 'Avro',      description: 'Real-time alarm lifecycle events on Kafka' },
        { id: 'op-009-3', name: 'Cleared Alarm Archive',     type: 'batch',     format: 'CSV',       description: 'Daily archive of all cleared alarms for post-mortem' },
      ],
      x: 580, y: 1320,
    },

    // ── LAYER 3 – Derived / Cross-Domain Products ─────────────

    {
      id: 'dp-010', name: 'Customer 360 Profile',
      domain: 'Analytics', owner: 'Customer Analytics Platform',
      version: '2.5.0', status: 'active',
      sla: '99.5%', updateFrequency: 'Near real-time',
      accessTier: 'premium',
      tags: ['customer360', 'analytics', 'SID', 'CLV', 'NBO', 'ML-feature-store'],
      description: 'Unified 360° customer view combining subscriber identity (TMF680), billing profile (TMF666), active product inventory (TMF637), and behavioural signals. Serves as the golden record for AI/ML feature stores, personalisation engines, and next-best-offer platforms.',
      inputPorts: [
        { id: 'ip-010-1', name: 'Subscriber Profile API', type: 'api',       format: 'REST',    description: 'Identity and tariff from Subscriber Master (TMF680)' },
        { id: 'ip-010-2', name: 'Account & Billing API',  type: 'api',       format: 'REST',    description: 'Financial profile from Customer Account (TMF666)' },
        { id: 'ip-010-3', name: 'Product Inventory API',  type: 'api',       format: 'REST',    description: 'Active subscriptions from Product Inventory (TMF637)' },
      ],
      outputPorts: [
        { id: 'op-010-1', name: 'Customer 360 API',         type: 'api',       format: 'REST/JSON', description: 'Enriched customer profile with LTV, NPS, and segment scores' },
        { id: 'op-010-2', name: 'Unified Customer Events',  type: 'streaming', format: 'Avro',      description: 'Kafka: consolidated customer change events (all domains)' },
        { id: 'op-010-3', name: 'Customer Feature Store',   type: 'batch',     format: 'Parquet',   description: 'Daily ML feature vectors per subscriber (data lake)' },
      ],
      x: 1080, y: 80,
    },

    {
      id: 'dp-011', name: 'Service Quality & SLA Analytics',
      domain: 'Service', owner: 'Service Assurance Analytics',
      version: '1.6.0', status: 'active',
      sla: '99.0%', updateFrequency: 'Every 15 min',
      accessTier: 'standard',
      tags: ['SLA', 'QoS', 'TMF657', 'assurance', 'degradation', 'SID'],
      description: 'TM Forum TMF657 Service Quality Management — monitors service-level KPIs against contracted SLA thresholds for mobile data, voice, IoT, and enterprise VPN services. Detects SLA breaches, generates proactive degradation alerts, and provides SLA compliance reporting for wholesale customers.',
      inputPorts: [
        { id: 'ip-011-1', name: 'Service Inventory API (TMF638)', type: 'api',       format: 'REST',    description: 'Active service instances and SLA parameters' },
        { id: 'ip-011-2', name: 'Network KPI API',                type: 'api',       format: 'REST',    description: 'Underlying cell/node performance from Network Performance' },
        { id: 'ip-011-3', name: 'Probe & DPI Measurements',       type: 'streaming', format: 'JSON',    description: 'Passive/active probe data (PCMD, DPI from Netscout/Tektronix)' },
      ],
      outputPorts: [
        { id: 'op-011-1', name: 'SLA Compliance API (TMF657)',  type: 'api',       format: 'REST/JSON', description: 'Real-time SLA adherence per service / customer' },
        { id: 'op-011-2', name: 'Quality Degradation Alerts',   type: 'streaming', format: 'JSON',      description: 'Kafka: SLA breach and pre-breach warning events' },
        { id: 'op-011-3', name: 'SLA Report Batch',             type: 'batch',     format: 'Parquet',   description: 'Monthly SLA compliance report for enterprise billing' },
      ],
      x: 1080, y: 420,
    },

    {
      id: 'dp-012', name: 'RAN & Cell Performance Analytics',
      domain: 'Network', owner: 'RAN Engineering Analytics',
      version: '2.2.1', status: 'active',
      sla: '99.0%', updateFrequency: 'Every 15 min',
      accessTier: 'standard',
      tags: ['RAN', '5G', 'NR', 'cell', 'coverage', 'capacity', '3GPP', 'SON'],
      description: 'Deep RAN analytics platform processing 3GPP cell-level KPIs (accessibility, retainability, integrity, availability) across 4G/5G NR layers. Produces coverage and capacity heatmaps, detects anomalous cells, and provides SON/optimisation inputs for automated network management.',
      inputPorts: [
        { id: 'ip-012-1', name: 'Network KPI API',              type: 'api',       format: 'REST',  description: 'Cell and node KPIs from Network Performance product' },
        { id: 'ip-012-2', name: 'Resource Inventory (TMF639)',  type: 'api',       format: 'REST',  description: 'Cell site geo-coordinates and antenna parameters' },
        { id: 'ip-012-3', name: 'Alarm Event Stream',           type: 'streaming', format: 'Avro',  description: 'Cell-level fault events from Alarm Management' },
      ],
      outputPorts: [
        { id: 'op-012-1', name: 'Cell KPI API',            type: 'api',       format: 'REST/JSON', description: 'Per-cell performance metrics with trending and anomaly scores' },
        { id: 'op-012-2', name: 'Coverage & Capacity Feed', type: 'batch',    format: 'GeoJSON',   description: 'Weekly coverage heatmaps and capacity utilisation per site' },
        { id: 'op-012-3', name: 'RAN Anomaly Alerts',      type: 'streaming', format: 'JSON',      description: 'Real-time cell anomaly and degradation events' },
      ],
      x: 1080, y: 760,
    },

    {
      id: 'dp-013', name: 'Revenue Assurance Data',
      domain: 'Finance', owner: 'Revenue Assurance & Fraud',
      version: '1.9.0', status: 'active',
      sla: '99.5%', updateFrequency: 'Daily',
      accessTier: 'premium',
      tags: ['revenue-assurance', 'leakage', 'reconciliation', 'RAFM', 'GRAPA'],
      description: 'End-to-end revenue assurance platform performing CDR-to-invoice reconciliation, plan conformance checks, and usage-vs-billing correlation. Implements GRAPA (Global Revenue Assurance Professional Association) controls. Detects leakage points across mediation, rating, billing, and interconnect settlement.',
      inputPorts: [
        { id: 'ip-013-1', name: 'Normalised CDR Stream',  type: 'streaming', format: 'Avro',      description: 'Decoded xDRs from Usage Records for billing reconciliation' },
        { id: 'ip-013-2', name: 'Product Inventory API',  type: 'api',       format: 'REST',      description: 'Active product instances for plan conformance checks (TMF637)' },
        { id: 'ip-013-3', name: 'Account & Billing API',  type: 'api',       format: 'REST',      description: 'Billed amounts and invoices for CDR-to-bill reconciliation' },
      ],
      outputPorts: [
        { id: 'op-013-1', name: 'Revenue KPI API',          type: 'api',       format: 'REST/JSON', description: 'ARPU, revenue-per-service, and reconciliation KPIs' },
        { id: 'op-013-2', name: 'Revenue Leakage Alerts',   type: 'streaming', format: 'JSON',      description: 'Real-time alerts for detected revenue leakage events' },
        { id: 'op-013-3', name: 'RA Assurance Report',      type: 'batch',     format: 'Parquet',   description: 'Monthly revenue assurance control results for audit' },
      ],
      x: 1080, y: 1100,
    },

    {
      id: 'dp-014', name: 'Roaming & Interconnect CDR Data',
      domain: 'Partner', owner: 'Wholesale & Roaming Team',
      version: '2.0.1', status: 'active',
      sla: '99.0%', updateFrequency: 'Near real-time',
      accessTier: 'premium',
      tags: ['roaming', 'interconnect', 'TAP3', 'NRTRDE', 'GSMA', 'IR.21', 'wholesale'],
      description: 'Inbound and outbound roaming CDR processing pipeline conforming to GSMA TAP3 (Transfer Account Procedures) and NRTRDE (Near Real-Time Roaming Data Exchange). Normalises visited-network CDRs, applies IOT (Inter-Operator Tariff) rates, and feeds interconnect settlement.',
      inputPorts: [
        { id: 'ip-014-1', name: 'TAP3 / NRTRDE Files',   type: 'batch',     format: 'ASN.1',  description: 'GSMA-format roaming CDR files from IPX clearing houses' },
        { id: 'ip-014-2', name: 'IPX Clearing House API', type: 'api',       format: 'REST',   description: 'Real-time NRTRDE records via GSMA IPX partner API' },
        { id: 'ip-014-3', name: 'Visited Network CDRs',   type: 'batch',     format: 'CSV',    description: 'Bilateral CDR exchange from direct-peering partners' },
      ],
      outputPorts: [
        { id: 'op-014-1', name: 'Normalised Roaming CDR API', type: 'api',       format: 'REST/JSON', description: 'Decoded and rated roaming CDRs with IOT tariff applied' },
        { id: 'op-014-2', name: 'Roaming Usage Stream',       type: 'streaming', format: 'Avro',      description: 'Real-time inbound/outbound roaming events on Kafka' },
        { id: 'op-014-3', name: 'TAP3 Settlement Batch',      type: 'batch',     format: 'ASN.1',     description: 'Monthly outbound TAP3 file for GSMA clearing submission' },
      ],
      x: 1080, y: 1440,
    },

    // ── LAYER 4 – Intelligence & Insight Products ─────────────

    {
      id: 'dp-015', name: 'Customer Segmentation & Value Scoring',
      domain: 'Analytics', owner: 'Customer Value Management',
      version: '3.1.0', status: 'active',
      sla: '99.0%', updateFrequency: 'Daily',
      accessTier: 'premium',
      tags: ['segmentation', 'CLV', 'ARPU', 'CVM', 'ML', 'analytics'],
      description: 'AI/ML-driven customer segmentation and value-scoring platform. Produces 12-month CLV predictions, ARPU propensity bands, strategic segments (High Value, At Risk, Growth, Digital Native), and microsegments for targeted marketing. Consumes Customer 360 features, usage patterns, and revenue KPIs.',
      inputPorts: [
        { id: 'ip-015-1', name: 'Customer 360 API',       type: 'api',   format: 'REST',    description: 'Enriched subscriber profiles and behavioural attributes' },
        { id: 'ip-015-2', name: 'Aggregated Usage Batch', type: 'batch', format: 'Parquet', description: '90-day usage trends per subscriber from CDR product' },
        { id: 'ip-015-3', name: 'Revenue KPI API',        type: 'api',   format: 'REST',    description: 'ARPU and revenue contribution from Revenue Assurance' },
      ],
      outputPorts: [
        { id: 'op-015-1', name: 'Segment Score API',       type: 'api',       format: 'REST/JSON', description: 'Real-time segment and CLV scores per MSISDN' },
        { id: 'op-015-2', name: 'Customer Segment Batch',  type: 'batch',     format: 'Parquet',   description: 'Full segmentation dataset in data lake (daily refresh)' },
        { id: 'op-015-3', name: 'ARPU Scoring Feed',       type: 'streaming', format: 'JSON',      description: 'Kafka: ARPU propensity events triggered by usage milestones' },
      ],
      x: 1580, y: 80,
    },

    {
      id: 'dp-016', name: 'Customer Experience & NPS Analytics',
      domain: 'Analytics', owner: 'CEM / Service Quality Analytics',
      version: '2.0.0', status: 'active',
      sla: '99.0%', updateFrequency: 'Hourly',
      accessTier: 'premium',
      tags: ['CEM', 'NPS', 'experience', 'QoE', 'TM-Forum-CEM', 'CSAT'],
      description: 'TM Forum Customer Experience Management (CEM) analytics platform. Correlates network quality (SLA compliance, RAN cell KPIs) with subscriber behaviour and profile data to compute per-subscriber QoE scores, predict NPS, and identify experience-led churn risk. Underpins proactive customer care and network investment prioritisation.',
      inputPorts: [
        { id: 'ip-016-1', name: 'SLA Compliance API (TMF657)', type: 'api',   format: 'REST',    description: 'Per-subscriber SLA adherence scores from Service Quality' },
        { id: 'ip-016-2', name: 'Cell KPI API',                type: 'api',   format: 'REST',    description: 'Serving-cell quality for each subscriber from RAN Analytics' },
        { id: 'ip-016-3', name: 'Customer Feature Store',      type: 'batch', format: 'Parquet', description: 'Subscriber ML feature vectors from Customer 360' },
      ],
      outputPorts: [
        { id: 'op-016-1', name: 'CEM Score API',             type: 'api',       format: 'REST/JSON', description: 'Real-time QoE and predicted NPS per subscriber' },
        { id: 'op-016-2', name: 'NPS Prediction Feed',       type: 'streaming', format: 'JSON',      description: 'Kafka: NPS drop events for proactive customer care' },
        { id: 'op-016-3', name: 'Experience Quality Batch',  type: 'batch',     format: 'Parquet',   description: 'Daily subscriber experience scores for planning and BI' },
      ],
      x: 1580, y: 450,
    },

    {
      id: 'dp-017', name: 'Fraud Detection & Prevention',
      domain: 'Finance', owner: 'Revenue Assurance & Fraud (RAFM)',
      version: '2.4.0', status: 'active',
      sla: '99.9%', updateFrequency: 'Real-time',
      accessTier: 'premium',
      tags: ['fraud', 'RAFM', 'IRSF', 'SIM-swap', 'GSMA', 'ML', 'real-time'],
      description: 'Real-time ML-based fraud detection covering IRSF (International Revenue Share Fraud), SIM-swap fraud, SIMBOX/bypass, subscription fraud, and account takeover. Processes the full CDR stream with velocity checks, subscriber behavioural baselines, and revenue-leakage signals. Implements GSMA FS.31 fraud controls.',
      inputPorts: [
        { id: 'ip-017-1', name: 'Normalised CDR Stream',  type: 'streaming', format: 'Avro',      description: 'Real-time CDRs for velocity and pattern analysis' },
        { id: 'ip-017-2', name: 'Subscriber Profile API', type: 'api',       format: 'REST',      description: 'Subscriber risk attributes and account history (TMF680)' },
        { id: 'ip-017-3', name: 'Revenue Leakage Alerts', type: 'streaming', format: 'JSON',      description: 'Revenue anomaly signals from Revenue Assurance' },
      ],
      outputPorts: [
        { id: 'op-017-1', name: 'Fraud Risk Score API',        type: 'api',       format: 'REST/JSON', description: 'Real-time fraud probability score and risk category per MSISDN' },
        { id: 'op-017-2', name: 'Fraud Alert Stream',          type: 'streaming', format: 'Avro',      description: 'High-confidence fraud events for automated blocking' },
        { id: 'op-017-3', name: 'Fraud Investigation Report',  type: 'batch',     format: 'Parquet',   description: 'Weekly fraud case details for legal and regulatory reporting' },
      ],
      x: 1580, y: 820,
    },

    {
      id: 'dp-018', name: 'Partner & Wholesale Settlement',
      domain: 'Partner', owner: 'Wholesale Operations',
      version: '1.3.0', status: 'active',
      sla: '99.0%', updateFrequency: 'Daily',
      accessTier: 'premium',
      tags: ['wholesale', 'settlement', 'IOT', 'TAP3', 'GSMA', 'IR.77', 'interconnect'],
      description: 'End-to-end wholesale and roaming settlement platform conforming to GSMA PRD IR.77 and TAP3 procedures. Calculates inter-operator traffic (IOT) charges, validates disputed CDRs, generates outbound TAP3 settlement files, and produces wholesale revenue reports for carrier finance.',
      inputPorts: [
        { id: 'ip-018-1', name: 'Normalised Roaming CDR API',  type: 'api',   format: 'REST',    description: 'Rated inbound/outbound roaming CDRs (GSMA TAP3/NRTRDE)' },
        { id: 'ip-018-2', name: 'Revenue KPI API',             type: 'api',   format: 'REST',    description: 'Interco revenue benchmarks from Revenue Assurance' },
        { id: 'ip-018-3', name: 'Interconnect Agreements',     type: 'batch', format: 'CSV',     description: 'IOT tariff tables and bilateral roaming agreement terms' },
      ],
      outputPorts: [
        { id: 'op-018-1', name: 'Settlement Invoice API',      type: 'api',       format: 'REST/JSON', description: 'Inter-operator settlement invoice queries and status' },
        { id: 'op-018-2', name: 'IOT Settlement Batch',        type: 'batch',     format: 'XML',       description: 'Monthly TAP3-format settlement files for GSMA clearing' },
        { id: 'op-018-3', name: 'Wholesale Revenue Report',    type: 'batch',     format: 'Parquet',   description: 'Carrier finance report: roaming P&L by partner/country' },
      ],
      x: 1580, y: 1190,
    },

    // ── LAYER 5 – Strategic Intelligence ──────────────────────

    {
      id: 'dp-019', name: 'Churn Prediction & Retention Intelligence',
      domain: 'Analytics', owner: 'Customer Retention Analytics',
      version: '1.7.0', status: 'active',
      sla: '99.0%', updateFrequency: 'Daily',
      accessTier: 'premium',
      tags: ['churn', 'retention', 'propensity', 'ML', 'CVM', 'CLV'],
      description: 'Ensemble ML model (XGBoost + neural network) predicting 30/60/90-day voluntary churn propensity for every active subscriber. Combines customer segmentation features with experience quality signals. Outputs include save-offer recommendations, retention campaign triggers, and contract-renewal propensity scores.',
      inputPorts: [
        { id: 'ip-019-1', name: 'Customer Segment Batch', type: 'batch', format: 'Parquet', description: 'CLV, ARPU segment, and behavioural features from CVM platform' },
        { id: 'ip-019-2', name: 'CEM Score API',          type: 'api',   format: 'REST',    description: 'Experience quality and predicted NPS from CEM Analytics' },
      ],
      outputPorts: [
        { id: 'op-019-1', name: 'Churn Risk Score API',       type: 'api',       format: 'REST/JSON', description: 'Real-time churn probability and retention offer recommendation' },
        { id: 'op-019-2', name: 'Retention Campaign Feed',    type: 'streaming', format: 'JSON',      description: 'Kafka: high-risk events for real-time intervention workflows' },
        { id: 'op-019-3', name: 'Churn Analytics Report',     type: 'batch',     format: 'Parquet',   description: 'Monthly churn cohort analysis and model performance report' },
      ],
      x: 2080, y: 220,
    },

    {
      id: 'dp-020', name: 'Network Capacity & Investment Planning',
      domain: 'Operations', owner: 'Network Planning & Strategy',
      version: '1.1.0', status: 'draft',
      sla: '98.0%', updateFrequency: 'Weekly',
      accessTier: 'premium',
      tags: ['capacity', 'planning', '5G', 'investment', 'RAN', 'NR', 'SON', 'forecasting'],
      description: 'Network capacity forecasting and investment recommendation platform. Combines RAN coverage/capacity heatmaps with subscriber experience quality trends to produce 12/24-month capacity forecasts, identify congestion hotspots, and generate prioritised site upgrade and 5G NR rollout recommendations. Feeds the CAPEX planning cycle.',
      inputPorts: [
        { id: 'ip-020-1', name: 'Coverage & Capacity Feed',   type: 'batch', format: 'GeoJSON', description: 'Cell-level capacity utilisation and coverage maps from RAN Analytics' },
        { id: 'ip-020-2', name: 'Experience Quality Batch',   type: 'batch', format: 'Parquet', description: 'Subscriber QoE scores and congestion signals from CEM Analytics' },
        { id: 'ip-020-3', name: 'Subscriber Growth Forecast', type: 'batch', format: 'CSV',     description: 'Commercial subscriber growth projections from strategy team' },
      ],
      outputPorts: [
        { id: 'op-020-1', name: 'Capacity Forecast API',            type: 'api',   format: 'REST/JSON', description: '12/24-month capacity forecasts per cell site with confidence bands' },
        { id: 'op-020-2', name: 'Investment Recommendation Report', type: 'batch', format: 'Parquet',   description: 'Prioritised CAPEX recommendations with ROI estimates' },
        { id: 'op-020-3', name: 'Site Planning Feed',               type: 'batch', format: 'GeoJSON',   description: 'New site candidates and upgrade priorities for RAN planning tools' },
      ],
      x: 2080, y: 660,
    },

    // ── SUBSCRIBER DOMAIN – dp-021 to dp-028 ──────────────────

    {
      id: 'dp-021', name: 'Customer Interaction History',
      domain: 'Subscriber', owner: 'BSS Data Office',
      version: '1.4.0', status: 'active',
      sla: '99.9%', updateFrequency: 'Real-time',
      accessTier: 'standard',
      tags: ['subscriber', 'interaction', 'TMF683', 'omnichannel', 'CRM'],
      description: 'Unified log of all customer touchpoints across digital, IVR, agent, and retail channels aligned with TMF683 Party Interaction API. Enables next-best-action and contact-centre analytics.',
      inputPorts: [
        { id: 'ip-021-1', name: 'CRM Event Stream',     type: 'streaming', format: 'Avro',   description: 'Real-time events from Salesforce / Siebel CRM' },
        { id: 'ip-021-2', name: 'IVR Call Logs',        type: 'batch',     format: 'CSV',    description: 'Nightly call-detail log from IVR platform' },
        { id: 'ip-021-3', name: 'Digital Channel API',  type: 'api',       format: 'JSON',   description: 'App & web session interactions via TMF683' },
      ],
      outputPorts: [
        { id: 'op-021-1', name: 'Interaction API',      type: 'api',       format: 'JSON',   description: 'Query interface for downstream analytics' },
        { id: 'op-021-2', name: 'Interaction Stream',   type: 'streaming', format: 'Avro',   description: 'Live feed for real-time personalisation engines' },
      ],
      x: 2580, y: 80,
    },

    {
      id: 'dp-022', name: 'Device Registry & IMEI Data',
      domain: 'Subscriber', owner: 'BSS Data Office',
      version: '2.1.0', status: 'active',
      sla: '99.9%', updateFrequency: 'Daily',
      accessTier: 'standard',
      tags: ['subscriber', 'device', 'IMEI', 'GSMA', 'TAC'],
      description: 'Authoritative registry of customer devices linked to MSISDN/IMSI, enriched with GSMA IMEI TAC database for make/model/OS attributes. Supports device-based segmentation and fraud detection.',
      inputPorts: [
        { id: 'ip-022-1', name: 'HLR/HSS Feed',        type: 'batch',     format: 'ASN.1',  description: 'IMSI-IMEI mapping from HLR/HSS' },
        { id: 'ip-022-2', name: 'GSMA IMEI DB',        type: 'batch',     format: 'CSV',    description: 'Monthly GSMA TAC database refresh' },
      ],
      outputPorts: [
        { id: 'op-022-1', name: 'Device Registry API', type: 'api',       format: 'JSON',   description: 'REST API for device lookups' },
        { id: 'op-022-2', name: 'Device Snapshot',     type: 'batch',     format: 'Parquet',description: 'Daily snapshot for analytics platforms' },
      ],
      x: 2580, y: 180,
    },

    {
      id: 'dp-023', name: 'SIM Card Lifecycle Management',
      domain: 'Subscriber', owner: 'BSS Data Office',
      version: '1.3.2', status: 'active',
      sla: '99.95%', updateFrequency: 'Real-time',
      accessTier: 'standard',
      tags: ['subscriber', 'SIM', 'eSIM', 'GSMA SGP.22', 'lifecycle'],
      description: 'Tracks physical and eSIM (eUICC) lifecycle states from provisioning through port-out, including GSMA SGP.22 RSP events. Supports SIM swap fraud detection and eSIM profile management.',
      inputPorts: [
        { id: 'ip-023-1', name: 'SIM Provisioning API', type: 'api',      format: 'JSON',   description: 'SIM personalisation & activation events' },
        { id: 'ip-023-2', name: 'eSIM RSP Events',      type: 'event',    format: 'JSON',   description: 'GSMA SGP.22 remote SIM provisioning events' },
      ],
      outputPorts: [
        { id: 'op-023-1', name: 'SIM Status API',       type: 'api',      format: 'JSON',   description: 'Current SIM state query endpoint' },
        { id: 'op-023-2', name: 'Lifecycle Events',     type: 'streaming',format: 'Avro',   description: 'Stream of SIM lifecycle transitions' },
      ],
      x: 2580, y: 280,
    },

    {
      id: 'dp-024', name: 'Digital Identity & Authentication Events',
      domain: 'Subscriber', owner: 'BSS Data Office',
      version: '1.2.0', status: 'active',
      sla: '99.99%', updateFrequency: 'Real-time',
      accessTier: 'premium',
      tags: ['subscriber', 'identity', 'authentication', 'OAuth2', 'OIDC', 'fraud'],
      description: 'Logs authentication and authorisation events from digital channels (app, web, USSD) using OIDC/OAuth2 flows. Feeds fraud detection models and customer identity analytics.',
      inputPorts: [
        { id: 'ip-024-1', name: 'IAM Event Stream',    type: 'streaming', format: 'JSON',   description: 'Real-time auth events from identity provider' },
        { id: 'ip-024-2', name: 'App Auth Logs',       type: 'batch',     format: 'JSON',   description: 'Mobile app authentication logs' },
      ],
      outputPorts: [
        { id: 'op-024-1', name: 'Auth Event Stream',   type: 'streaming', format: 'Avro',   description: 'Live feed for fraud detection systems' },
        { id: 'op-024-2', name: 'Identity API',        type: 'api',       format: 'JSON',   description: 'Identity verification query API' },
      ],
      x: 2580, y: 380,
    },

    {
      id: 'dp-025', name: 'Customer Consent & Privacy Management',
      domain: 'Subscriber', owner: 'Legal & Compliance',
      version: '2.0.1', status: 'active',
      sla: '99.99%', updateFrequency: 'Real-time',
      accessTier: 'standard',
      tags: ['subscriber', 'GDPR', 'consent', 'privacy', 'TMF644', 'ePrivacy'],
      description: 'Manages customer consent records across all processing purposes per GDPR Article 6/7 and TMF644 Privacy Management API. Acts as the authoritative consent store for all downstream data processing.',
      inputPorts: [
        { id: 'ip-025-1', name: 'Consent Portal Events', type: 'event',   format: 'JSON',   description: 'Opt-in/opt-out events from self-service portal' },
        { id: 'ip-025-2', name: 'Agent Consent Updates',  type: 'api',    format: 'JSON',   description: 'Consent changes captured in call centre' },
      ],
      outputPorts: [
        { id: 'op-025-1', name: 'Consent API (TMF644)',   type: 'api',    format: 'JSON',   description: 'Consent check API for downstream products' },
        { id: 'op-025-2', name: 'Consent Change Events',  type: 'event',  format: 'Avro',   description: 'Real-time consent change notifications' },
      ],
      x: 2580, y: 480,
    },

    {
      id: 'dp-026', name: 'Subscriber Geolocation & Mobility Data',
      domain: 'Subscriber', owner: 'Network Engineering',
      version: '1.1.0', status: 'draft',
      sla: '99.5%', updateFrequency: 'Hourly',
      accessTier: 'premium',
      tags: ['subscriber', 'geolocation', 'mobility', 'CDR', 'privacy', 'anonymised'],
      description: 'Anonymised and aggregated subscriber mobility patterns derived from network signalling (CDR, TAU, handover events). Supports smart-city, retail analytics, and network planning use cases under GDPR pseudonymisation.',
      inputPorts: [
        { id: 'ip-026-1', name: 'Network Signalling CDR', type: 'streaming',format: 'ASN.1', description: 'Location update and TAU event stream from RAN' },
        { id: 'ip-026-2', name: 'Cell Site Topology',     type: 'batch',    format: 'JSON',  description: 'Cell ID to geo-coordinate mapping' },
      ],
      outputPorts: [
        { id: 'op-026-1', name: 'Mobility Heatmap API',   type: 'api',      format: 'JSON',  description: 'Aggregated mobility heatmaps (anonymised)' },
        { id: 'op-026-2', name: 'Mobility Dataset',       type: 'batch',    format: 'Parquet',description: 'Daily mobility aggregation export' },
      ],
      x: 2580, y: 580,
    },

    {
      id: 'dp-027', name: 'Customer Service Request Data',
      domain: 'Subscriber', owner: 'BSS Data Office',
      version: '1.5.0', status: 'active',
      sla: '99.9%', updateFrequency: 'Real-time',
      accessTier: 'standard',
      tags: ['subscriber', 'TMF641', 'service-request', 'trouble-ticket', 'CRM'],
      description: 'Captures service requests and trouble tickets raised by customers aligned with TMF641 Service Order Management API. Enables SLA tracking, root-cause analysis, and first-call-resolution metrics.',
      inputPorts: [
        { id: 'ip-027-1', name: 'Ticketing System Feed', type: 'api',      format: 'JSON',   description: 'Service requests from ServiceNow / Remedy' },
        { id: 'ip-027-2', name: 'Agent Desktop Events',  type: 'event',    format: 'JSON',   description: 'Call-centre agent interaction events' },
      ],
      outputPorts: [
        { id: 'op-027-1', name: 'Service Request API',   type: 'api',      format: 'JSON',   description: 'TMF641 compliant service request query API' },
        { id: 'op-027-2', name: 'Ticket Analytics Feed', type: 'batch',    format: 'Parquet',description: 'Aggregated ticket data for BI dashboards' },
      ],
      x: 2580, y: 680,
    },

    {
      id: 'dp-028', name: 'Subscriber Self-Service Analytics',
      domain: 'Subscriber', owner: 'Digital Experience',
      version: '1.0.3', status: 'active',
      sla: '99.5%', updateFrequency: 'Hourly',
      accessTier: 'free',
      tags: ['subscriber', 'self-service', 'app', 'digital', 'UX', 'funnel'],
      description: 'Aggregated behavioural analytics from My Account app and web portal covering feature usage, funnel completion, and digital adoption KPIs. Drives UX optimisation and digital deflection strategies.',
      inputPorts: [
        { id: 'ip-028-1', name: 'App Analytics SDK',    type: 'streaming', format: 'JSON',   description: 'In-app event stream from mobile analytics SDK' },
        { id: 'ip-028-2', name: 'Web Analytics',        type: 'batch',     format: 'JSON',   description: 'Session data from web analytics platform' },
      ],
      outputPorts: [
        { id: 'op-028-1', name: 'Self-Service KPI API', type: 'api',       format: 'JSON',   description: 'Aggregated KPI query endpoint for BI' },
        { id: 'op-028-2', name: 'Funnel Dataset',       type: 'batch',     format: 'Parquet',description: 'Daily funnel analysis dataset' },
      ],
      x: 2580, y: 780,
    },

    // ── PRODUCT DOMAIN – dp-029 to dp-036 ─────────────────────

    {
      id: 'dp-029', name: 'Product Offering Configuration',
      domain: 'Product', owner: 'Product Management',
      version: '3.0.0', status: 'active',
      sla: '99.9%', updateFrequency: 'Daily',
      accessTier: 'standard',
      tags: ['product', 'TMF620', 'offering', 'catalog', 'BSS'],
      description: 'Manages product offering specifications and configurations per TMF620 Product Catalog Management API. Supports complex bundling, pricing rules, eligibility criteria, and offer versioning.',
      inputPorts: [
        { id: 'ip-029-1', name: 'CPQ System Feed',       type: 'api',      format: 'JSON',   description: 'Configure-Price-Quote system offer definitions' },
        { id: 'ip-029-2', name: 'Marketing Brief',       type: 'batch',    format: 'CSV',    description: 'New offer requests from marketing team' },
      ],
      outputPorts: [
        { id: 'op-029-1', name: 'Offering API (TMF620)', type: 'api',      format: 'JSON',   description: 'TMF620 compliant product offering catalog' },
        { id: 'op-029-2', name: 'Offering Events',       type: 'event',    format: 'Avro',   description: 'Offering create/update/retire events' },
      ],
      x: 3080, y: 80,
    },

    {
      id: 'dp-030', name: 'Product Order Management',
      domain: 'Product', owner: 'Product Management',
      version: '2.3.1', status: 'active',
      sla: '99.95%', updateFrequency: 'Real-time',
      accessTier: 'standard',
      tags: ['product', 'TMF622', 'order', 'fulfillment', 'BSS'],
      description: 'End-to-end product order lifecycle management aligned with TMF622 Product Ordering Management API. Orchestrates order decomposition, jeopardy management, and order fallout handling.',
      inputPorts: [
        { id: 'ip-030-1', name: 'Sales Channel Orders',  type: 'api',      format: 'JSON',   description: 'Product orders from POS, online, and agent channels' },
        { id: 'ip-030-2', name: 'Partner Orders',        type: 'api',      format: 'JSON',   description: 'Wholesale and MVNO product orders' },
      ],
      outputPorts: [
        { id: 'op-030-1', name: 'Order API (TMF622)',    type: 'api',      format: 'JSON',   description: 'TMF622 product order query and status API' },
        { id: 'op-030-2', name: 'Order Event Stream',   type: 'streaming', format: 'Avro',   description: 'Order state change events for orchestration' },
      ],
      x: 3080, y: 180,
    },

    {
      id: 'dp-031', name: 'Bundle & Promotion Registry',
      domain: 'Product', owner: 'Product Management',
      version: '1.8.0', status: 'active',
      sla: '99.9%', updateFrequency: 'Daily',
      accessTier: 'standard',
      tags: ['product', 'bundle', 'promotion', 'discount', 'TMF671'],
      description: 'Central repository for all commercial bundles and promotional offers with eligibility rules, discount structures, and campaign periods. Feeds rating engines and recommendation systems.',
      inputPorts: [
        { id: 'ip-031-1', name: 'Campaign Management',  type: 'batch',    format: 'CSV',    description: 'Promotion definitions from campaign tool' },
        { id: 'ip-031-2', name: 'Pricing Engine Feed',  type: 'api',      format: 'JSON',   description: 'Bundle pricing rules from CPQ system' },
      ],
      outputPorts: [
        { id: 'op-031-1', name: 'Bundle Catalog API',   type: 'api',      format: 'JSON',   description: 'Active bundle and promo query endpoint' },
        { id: 'op-031-2', name: 'Promo Events',         type: 'event',    format: 'Avro',   description: 'Promotion activation and expiry events' },
      ],
      x: 3080, y: 280,
    },

    {
      id: 'dp-032', name: 'Product Lifecycle Events',
      domain: 'Product', owner: 'Product Management',
      version: '1.2.0', status: 'active',
      sla: '99.9%', updateFrequency: 'Real-time',
      accessTier: 'free',
      tags: ['product', 'lifecycle', 'event', 'TMF632', 'audit'],
      description: 'Immutable event log of all product lifecycle transitions (launch, change, retire) per TMF632 Party Management standards. Provides full audit trail for regulatory and commercial review.',
      inputPorts: [
        { id: 'ip-032-1', name: 'Product Catalog Events', type: 'event',  format: 'JSON',   description: 'State-change events from product catalog system' },
        { id: 'ip-032-2', name: 'BSS Change Events',      type: 'event',  format: 'JSON',   description: 'Subscription state changes from BSS' },
      ],
      outputPorts: [
        { id: 'op-032-1', name: 'Lifecycle Event API',    type: 'api',    format: 'JSON',   description: 'Historical lifecycle event query API' },
        { id: 'op-032-2', name: 'Lifecycle Stream',       type: 'streaming',format: 'Avro', description: 'Real-time product lifecycle event stream' },
      ],
      x: 3080, y: 380,
    },

    {
      id: 'dp-033', name: 'Pricing & Tariff Repository',
      domain: 'Product', owner: 'Revenue Management',
      version: '4.1.0', status: 'active',
      sla: '99.99%', updateFrequency: 'Daily',
      accessTier: 'standard',
      tags: ['product', 'pricing', 'tariff', 'TMF620', 'rating', 'BSS'],
      description: 'Authoritative repository for all retail and wholesale tariffs, rating parameters, and price-plan rules. Consumed by mediation, rating engines, and revenue assurance systems.',
      inputPorts: [
        { id: 'ip-033-1', name: 'Tariff Admin System',  type: 'batch',    format: 'CSV',    description: 'Tariff definitions from pricing admin tool' },
        { id: 'ip-033-2', name: 'Regulatory Feeds',     type: 'batch',    format: 'CSV',    description: 'Regulated price-cap data from regulator' },
      ],
      outputPorts: [
        { id: 'op-033-1', name: 'Tariff API',           type: 'api',      format: 'JSON',   description: 'Current tariff query endpoint for BSS systems' },
        { id: 'op-033-2', name: 'Tariff Snapshot',      type: 'batch',    format: 'Parquet',description: 'Daily tariff snapshot for analytics' },
      ],
      x: 3080, y: 480,
    },

    {
      id: 'dp-034', name: 'Product Performance Analytics',
      domain: 'Product', owner: 'Product Management',
      version: '2.0.0', status: 'active',
      sla: '99.5%', updateFrequency: 'Daily',
      accessTier: 'standard',
      tags: ['product', 'analytics', 'KPI', 'ARPU', 'churn', 'revenue'],
      description: 'Aggregated performance KPIs per product/tariff-plan including subscriber counts, ARPU, churn rates, and revenue contribution. Informs product portfolio management and rationalisation decisions.',
      inputPorts: [
        { id: 'ip-034-1', name: 'Billing Aggregates',   type: 'batch',    format: 'Parquet',description: 'Daily revenue aggregates from billing system' },
        { id: 'ip-034-2', name: 'Subscriber Counts',    type: 'batch',    format: 'CSV',    description: 'Daily product subscriber counts from BSS' },
      ],
      outputPorts: [
        { id: 'op-034-1', name: 'Product KPI API',      type: 'api',      format: 'JSON',   description: 'Product performance metrics query API' },
        { id: 'op-034-2', name: 'Performance Dataset',  type: 'batch',    format: 'Parquet',description: 'Product performance data lake export' },
      ],
      x: 3080, y: 580,
    },

    {
      id: 'dp-035', name: 'Feature & Entitlement Registry',
      domain: 'Product', owner: 'Product Management',
      version: '1.3.0', status: 'active',
      sla: '99.99%', updateFrequency: 'Real-time',
      accessTier: 'standard',
      tags: ['product', 'entitlement', 'feature', 'policy', 'PCRF'],
      description: 'Maps product subscriptions to network and service entitlements (data allowances, roaming rights, QoS tiers). Acts as the policy source-of-truth for PCRF/PCEF and service layer enforcement.',
      inputPorts: [
        { id: 'ip-035-1', name: 'Subscription Events',  type: 'streaming',format: 'Avro',   description: 'Real-time subscription activation events from BSS' },
        { id: 'ip-035-2', name: 'Feature Definitions',  type: 'batch',    format: 'JSON',   description: 'Feature and entitlement definitions from product catalog' },
      ],
      outputPorts: [
        { id: 'op-035-1', name: 'Entitlement API',      type: 'api',      format: 'JSON',   description: 'Real-time entitlement check API for PCRF' },
        { id: 'op-035-2', name: 'Policy Sync Stream',   type: 'streaming',format: 'Avro',   description: 'Policy change events for network enforcement' },
      ],
      x: 3080, y: 680,
    },

    {
      id: 'dp-036', name: 'Product Recommendation Engine Data',
      domain: 'Product', owner: 'AI & Data Science',
      version: '1.1.0', status: 'draft',
      sla: '99.5%', updateFrequency: 'Hourly',
      accessTier: 'premium',
      tags: ['product', 'recommendation', 'ML', 'AI', 'NBO', 'NBA'],
      description: 'Feature store and inference data for product recommendation models powering next-best-offer (NBO) and next-best-action (NBA) engines across digital and agent channels.',
      inputPorts: [
        { id: 'ip-036-1', name: 'Customer 360 Features', type: 'batch',   format: 'Parquet',description: 'Subscriber behavioural features from Customer 360' },
        { id: 'ip-036-2', name: 'Product Performance',   type: 'batch',   format: 'Parquet',description: 'Product KPI features from Product Performance Analytics' },
      ],
      outputPorts: [
        { id: 'op-036-1', name: 'Recommendation API',    type: 'api',     format: 'JSON',   description: 'Real-time product recommendations per subscriber' },
        { id: 'op-036-2', name: 'Batch Scores',          type: 'batch',   format: 'Parquet',description: 'Pre-computed recommendation scores for campaigns' },
      ],
      x: 3080, y: 780,
    },

    // ── SERVICE DOMAIN – dp-037 to dp-044 ─────────────────────

    {
      id: 'dp-037', name: 'Service Activation Events',
      domain: 'Service', owner: 'Service Engineering',
      version: '2.2.0', status: 'active',
      sla: '99.95%', updateFrequency: 'Real-time',
      accessTier: 'standard',
      tags: ['service', 'TMF640', 'activation', 'provisioning', 'OSS'],
      description: 'Real-time event stream of service activation, modification, and deactivation outcomes per TMF640 Service Activation & Configuration API. Key input for SLA monitoring and order jeopardy management.',
      inputPorts: [
        { id: 'ip-037-1', name: 'Provisioning System',  type: 'event',    format: 'JSON',   description: 'Activation outcome events from OSS provisioning' },
        { id: 'ip-037-2', name: 'NE Provisioning ACK',  type: 'streaming',format: 'Avro',   description: 'Network element provisioning acknowledgements' },
      ],
      outputPorts: [
        { id: 'op-037-1', name: 'Activation Event API', type: 'api',      format: 'JSON',   description: 'TMF640 service activation status query' },
        { id: 'op-037-2', name: 'Activation Stream',    type: 'streaming',format: 'Avro',   description: 'Live activation events for order orchestration' },
      ],
      x: 3580, y: 80,
    },

    {
      id: 'dp-038', name: 'Service Problem Management',
      domain: 'Service', owner: 'Service Operations',
      version: '1.6.0', status: 'active',
      sla: '99.9%', updateFrequency: 'Real-time',
      accessTier: 'standard',
      tags: ['service', 'TMF656', 'trouble-ticket', 'ITIL', 'problem-management'],
      description: 'Manages service-layer trouble tickets and problem records per TMF656 Service Problem Management API and ITIL v4 practices. Correlates network alarms to customer-impacting service problems.',
      inputPorts: [
        { id: 'ip-038-1', name: 'Alarm Correlation Feed', type: 'streaming',format: 'Avro', description: 'Correlated alarm groups from network operations' },
        { id: 'ip-038-2', name: 'Customer Complaints',   type: 'api',      format: 'JSON',  description: 'Customer-reported faults from CRM' },
      ],
      outputPorts: [
        { id: 'op-038-1', name: 'Problem Record API',    type: 'api',      format: 'JSON',  description: 'TMF656 service problem query and management API' },
        { id: 'op-038-2', name: 'Problem Event Stream',  type: 'streaming',format: 'Avro',  description: 'Live problem record state changes' },
      ],
      x: 3580, y: 180,
    },

    {
      id: 'dp-039', name: 'SLA Repository',
      domain: 'Service', owner: 'Service Management',
      version: '2.4.0', status: 'active',
      sla: '99.99%', updateFrequency: 'Daily',
      accessTier: 'standard',
      tags: ['service', 'TMF623', 'SLA', 'QoS', 'enterprise'],
      description: 'Centrally manages SLA definitions, thresholds, and real-time compliance status per TMF623 SLA Management API. Supports B2B enterprise SLAs and wholesale partner agreements.',
      inputPorts: [
        { id: 'ip-039-1', name: 'SLA Definitions',      type: 'batch',    format: 'JSON',   description: 'SLA template definitions from contract management' },
        { id: 'ip-039-2', name: 'QoS Measurement Feed', type: 'streaming',format: 'Avro',   description: 'Real-time QoS metrics from service quality systems' },
      ],
      outputPorts: [
        { id: 'op-039-1', name: 'SLA API (TMF623)',     type: 'api',      format: 'JSON',   description: 'SLA compliance status and definition query API' },
        { id: 'op-039-2', name: 'SLA Breach Events',    type: 'event',    format: 'Avro',   description: 'Real-time SLA breach notifications' },
      ],
      x: 3580, y: 280,
    },

    {
      id: 'dp-040', name: 'IMS & VoLTE Service Data',
      domain: 'Service', owner: 'Voice Engineering',
      version: '3.0.0', status: 'active',
      sla: '99.99%', updateFrequency: 'Real-time',
      accessTier: 'standard',
      tags: ['service', 'IMS', 'VoLTE', 'VoWiFi', '3GPP', 'SIP', 'voice'],
      description: 'Captures IMS core signalling data for VoLTE, VoWiFi, and RCS services including SIP call detail records and IMS-level QoS measurements aligned with 3GPP TS 32.260.',
      inputPorts: [
        { id: 'ip-040-1', name: 'P-CSCF CDR Feed',     type: 'streaming', format: 'ASN.1',  description: 'SIP call detail records from IMS P-CSCF' },
        { id: 'ip-040-2', name: 'IMS Diameter Feed',   type: 'streaming', format: 'Diameter',description: 'Rx/Gx interface QoS events from PCRF' },
      ],
      outputPorts: [
        { id: 'op-040-1', name: 'VoLTE CDR API',       type: 'api',       format: 'JSON',   description: 'Voice CDR query API for billing and analytics' },
        { id: 'op-040-2', name: 'VoLTE QoS Stream',    type: 'streaming', format: 'Avro',   description: 'Real-time VoLTE quality metrics' },
      ],
      x: 3580, y: 380,
    },

    {
      id: 'dp-041', name: 'VAS Usage Data',
      domain: 'Service', owner: 'VAS Operations',
      version: '2.1.0', status: 'active',
      sla: '99.5%', updateFrequency: 'Hourly',
      accessTier: 'standard',
      tags: ['service', 'VAS', 'SMS', 'MMS', 'content', 'usage'],
      description: 'Aggregated usage records for value-added services including SMS, MMS, content services, and third-party APIs. Feeds revenue assurance and partner settlement systems.',
      inputPorts: [
        { id: 'ip-041-1', name: 'SMSC CDR Feed',       type: 'batch',     format: 'CSV',    description: 'SMS/MMS CDRs from message centre' },
        { id: 'ip-041-2', name: 'VAS Platform Events', type: 'event',     format: 'JSON',   description: 'Usage events from VAS platform' },
      ],
      outputPorts: [
        { id: 'op-041-1', name: 'VAS Usage API',       type: 'api',       format: 'JSON',   description: 'VAS usage query API for billing' },
        { id: 'op-041-2', name: 'VAS Usage Dataset',   type: 'batch',     format: 'Parquet',description: 'Daily VAS usage data for analytics' },
      ],
      x: 3580, y: 480,
    },

    {
      id: 'dp-042', name: 'IoT Service Management',
      domain: 'Service', owner: 'IoT Platform Team',
      version: '1.0.0', status: 'draft',
      sla: '99.5%', updateFrequency: 'Real-time',
      accessTier: 'premium',
      tags: ['service', 'TMF681', 'IoT', 'M2M', 'GSMA', 'connectivity'],
      description: 'Manages IoT device connectivity, SIM lifecycle, and data usage for M2M/IoT services per TMF681 Communication Service Management and GSMA IoT guidelines.',
      inputPorts: [
        { id: 'ip-042-1', name: 'IoT Platform Feed',   type: 'streaming', format: 'MQTT',   description: 'Device connectivity events from IoT platform' },
        { id: 'ip-042-2', name: 'M2M SIM Events',      type: 'event',     format: 'JSON',   description: 'IoT SIM lifecycle events from SIM management platform' },
      ],
      outputPorts: [
        { id: 'op-042-1', name: 'IoT Service API',     type: 'api',       format: 'JSON',   description: 'IoT connectivity status and management API' },
        { id: 'op-042-2', name: 'IoT Analytics Feed',  type: 'batch',     format: 'Parquet',description: 'IoT usage analytics for enterprise customers' },
      ],
      x: 3580, y: 580,
    },

    {
      id: 'dp-043', name: 'Fixed Broadband Service Data',
      domain: 'Service', owner: 'Fixed Network Operations',
      version: '2.0.0', status: 'active',
      sla: '99.9%', updateFrequency: 'Hourly',
      accessTier: 'standard',
      tags: ['service', 'broadband', 'FTTH', 'DSL', 'xDSL', 'GPON', 'CPE'],
      description: 'Operational and usage data for fixed broadband services (FTTH/GPON, xDSL) including CPE performance, line quality metrics, and service activation status. Feeds fault management and proactive maintenance.',
      inputPorts: [
        { id: 'ip-043-1', name: 'OLT/DSLAM Telemetry', type: 'streaming', format: 'SNMP',   description: 'Line-level performance counters from access network' },
        { id: 'ip-043-2', name: 'CPE TR-069 Data',     type: 'streaming', format: 'XML',    description: 'CPE device management data via TR-069/TR-369' },
      ],
      outputPorts: [
        { id: 'op-043-1', name: 'Broadband Service API', type: 'api',     format: 'JSON',   description: 'Fixed broadband service status query API' },
        { id: 'op-043-2', name: 'Line Quality Dataset',  type: 'batch',   format: 'Parquet',description: 'Daily line quality aggregation for analytics' },
      ],
      x: 3580, y: 680,
    },

    {
      id: 'dp-044', name: 'Enterprise Service Management',
      domain: 'Service', owner: 'B2B Service Delivery',
      version: '1.7.0', status: 'active',
      sla: '99.99%', updateFrequency: 'Real-time',
      accessTier: 'premium',
      tags: ['service', 'enterprise', 'B2B', 'MPLS', 'SD-WAN', 'SLA', 'managed-service'],
      description: 'Manages enterprise connectivity and managed service inventory including MPLS, SD-WAN, and cloud connectivity products. Provides real-time service assurance data for B2B SLA management.',
      inputPorts: [
        { id: 'ip-044-1', name: 'Enterprise NMS Feed',  type: 'streaming', format: 'SNMP',   description: 'Enterprise network management system telemetry' },
        { id: 'ip-044-2', name: 'SD-WAN Controller',   type: 'api',       format: 'JSON',   description: 'SD-WAN service health from centralised controller' },
      ],
      outputPorts: [
        { id: 'op-044-1', name: 'Enterprise Service API', type: 'api',    format: 'JSON',   description: 'B2B service health and SLA status API' },
        { id: 'op-044-2', name: 'Enterprise Dashboard Feed', type: 'batch',format: 'JSON',  description: 'Customer portal data feed for enterprise self-service' },
      ],
      x: 3580, y: 780,
    },

    // ── NETWORK DOMAIN – dp-045 to dp-054 ─────────────────────

    {
      id: 'dp-045', name: 'Core Network Signaling Data',
      domain: 'Network', owner: 'Network Engineering',
      version: '2.5.0', status: 'active',
      sla: '99.99%', updateFrequency: 'Real-time',
      accessTier: 'premium',
      tags: ['network', 'SS7', 'Diameter', 'signaling', '3GPP', 'MAP', 'CAMEL'],
      description: 'Captures SS7 (MAP/CAMEL) and Diameter protocol signalling data from core network nodes. Critical source for fraud detection, roaming analytics, and subscriber location services per 3GPP TS 29.002.',
      inputPorts: [
        { id: 'ip-045-1', name: 'SS7 Probe Feed',      type: 'streaming', format: 'MTP3',   description: 'SS7 signalling probe from STP/STPs' },
        { id: 'ip-045-2', name: 'Diameter Trace',      type: 'streaming', format: 'Diameter',description: 'Diameter interface traces from EPC nodes' },
      ],
      outputPorts: [
        { id: 'op-045-1', name: 'Signaling Analytics API', type: 'api',   format: 'JSON',   description: 'Decoded signalling event query API' },
        { id: 'op-045-2', name: 'Fraud Signal Stream',     type: 'streaming',format: 'Avro', description: 'Real-time fraud signal feed for security analytics' },
      ],
      x: 4080, y: 80,
    },

    {
      id: 'dp-046', name: 'IP Network Flow & Traffic Data',
      domain: 'Network', owner: 'Network Engineering',
      version: '3.1.0', status: 'active',
      sla: '99.9%', updateFrequency: 'Real-time',
      accessTier: 'standard',
      tags: ['network', 'IPFIX', 'NetFlow', 'traffic', 'DPI', 'peering'],
      description: 'Aggregated IP flow records (IPFIX/NetFlow v9) from routers and DPI platforms enabling traffic engineering, peering analytics, and network capacity planning across the IP/MPLS backbone.',
      inputPorts: [
        { id: 'ip-046-1', name: 'Router NetFlow Export', type: 'streaming',format: 'NetFlow',description: 'NetFlow v9/IPFIX from core and edge routers' },
        { id: 'ip-046-2', name: 'DPI Platform Feed',    type: 'streaming', format: 'Avro',   description: 'Application-level traffic classification from DPI' },
      ],
      outputPorts: [
        { id: 'op-046-1', name: 'Traffic Analytics API', type: 'api',     format: 'JSON',   description: 'IP traffic aggregation and trend query API' },
        { id: 'op-046-2', name: 'Traffic Dataset',       type: 'batch',   format: 'Parquet',description: 'Hourly traffic aggregation for capacity planning' },
      ],
      x: 4080, y: 180,
    },

    {
      id: 'dp-047', name: 'Transmission & Transport Network Data',
      domain: 'Network', owner: 'Transport Engineering',
      version: '2.0.0', status: 'active',
      sla: '99.9%', updateFrequency: 'Hourly',
      accessTier: 'standard',
      tags: ['network', 'transport', 'OTN', 'DWDM', 'SDH', 'microwave', 'TMF513'],
      description: 'Performance and topology data for optical transport (OTN/DWDM) and microwave transmission networks per TMF513 Network Topology specifications. Supports capacity and fault management.',
      inputPorts: [
        { id: 'ip-047-1', name: 'Optical NMS Feed',    type: 'batch',     format: 'XML',    description: 'Performance data from optical network management system' },
        { id: 'ip-047-2', name: 'Microwave NMS Feed',  type: 'batch',     format: 'SNMP',   description: 'Microwave link performance counters' },
      ],
      outputPorts: [
        { id: 'op-047-1', name: 'Transport KPI API',   type: 'api',       format: 'JSON',   description: 'Transport network KPI query endpoint' },
        { id: 'op-047-2', name: 'Capacity Dataset',    type: 'batch',     format: 'Parquet',description: 'Transport capacity utilisation dataset' },
      ],
      x: 4080, y: 280,
    },

    {
      id: 'dp-048', name: '5G Network Slice Management',
      domain: 'Network', owner: 'Network Engineering',
      version: '1.0.0', status: 'draft',
      sla: '99.99%', updateFrequency: 'Real-time',
      accessTier: 'premium',
      tags: ['network', '5G', 'slicing', 'NSSF', '3GPP', 'TS28.530', 'NSI'],
      description: 'Manages 5G Network Slice Instance (NSI) lifecycle, resource allocation, and SLA compliance per 3GPP TS 28.530. Enables dynamic slice creation for enterprise and vertical use cases.',
      inputPorts: [
        { id: 'ip-048-1', name: 'NSSF Events',         type: 'event',     format: 'JSON',   description: 'Network Slice Selection Function state events' },
        { id: 'ip-048-2', name: 'RAN Slice KPIs',      type: 'streaming', format: 'Avro',   description: 'Per-slice RAN performance KPIs from O-RAN' },
      ],
      outputPorts: [
        { id: 'op-048-1', name: 'Slice Management API', type: 'api',      format: 'JSON',   description: '5G slice SLA status and lifecycle management API' },
        { id: 'op-048-2', name: 'Slice Performance Feed', type: 'streaming',format: 'Avro', description: 'Real-time per-slice performance metrics' },
      ],
      x: 4080, y: 380,
    },

    {
      id: 'dp-049', name: 'Physical Network Topology',
      domain: 'Network', owner: 'Network Engineering',
      version: '3.2.0', status: 'active',
      sla: '99.9%', updateFrequency: 'Daily',
      accessTier: 'standard',
      tags: ['network', 'TMF639', 'topology', 'inventory', 'NBI', 'GIS'],
      description: 'Authoritative physical and logical network topology model per TMF639 Resource Inventory Management API. Includes sites, nodes, links, and their geo-spatial attributes from GIS and NMS systems.',
      inputPorts: [
        { id: 'ip-049-1', name: 'NMS Topology Sync',   type: 'batch',     format: 'XML',    description: 'Network element topology from NMS northbound interface' },
        { id: 'ip-049-2', name: 'GIS Platform Feed',   type: 'batch',     format: 'GeoJSON',description: 'Geospatial site and cable data from GIS' },
      ],
      outputPorts: [
        { id: 'op-049-1', name: 'Topology API (TMF639)', type: 'api',     format: 'JSON',   description: 'TMF639 network resource query API' },
        { id: 'op-049-2', name: 'Topology Graph Export', type: 'batch',   format: 'JSON',   description: 'Graph-format topology export for planning tools' },
      ],
      x: 4080, y: 480,
    },

    {
      id: 'dp-050', name: 'Network Configuration Repository',
      domain: 'Network', owner: 'Network Operations',
      version: '2.0.0', status: 'active',
      sla: '99.9%', updateFrequency: 'Real-time',
      accessTier: 'standard',
      tags: ['network', 'YANG', 'NETCONF', 'configuration', 'RESTCONF', 'GitOps'],
      description: 'Version-controlled repository of network element configurations using YANG data models and NETCONF/RESTCONF protocols. Supports configuration compliance checking and change audit trails.',
      inputPorts: [
        { id: 'ip-050-1', name: 'NETCONF Device Sync',  type: 'api',      format: 'XML',    description: 'Configuration pulls from NEs via NETCONF' },
        { id: 'ip-050-2', name: 'Change Events',        type: 'event',    format: 'JSON',   description: 'Configuration change notifications from NEMS' },
      ],
      outputPorts: [
        { id: 'op-050-1', name: 'Config Repository API', type: 'api',     format: 'JSON',   description: 'Network element configuration query and diff API' },
        { id: 'op-050-2', name: 'Config Audit Stream',   type: 'streaming',format: 'Avro',  description: 'Real-time configuration change audit events' },
      ],
      x: 4080, y: 580,
    },

    {
      id: 'dp-051', name: 'Spectrum & Radio Frequency Data',
      domain: 'Network', owner: 'Radio Planning',
      version: '1.5.0', status: 'active',
      sla: '99.5%', updateFrequency: 'Weekly',
      accessTier: 'premium',
      tags: ['network', 'spectrum', 'RF', 'RAN', '5G NR', 'LTE', 'regulatory'],
      description: 'Manages spectrum allocation, licence conditions, and radio frequency planning data including propagation models and interference analyses. Supports regulatory spectrum reporting and 5G NR deployment planning.',
      inputPorts: [
        { id: 'ip-051-1', name: 'Regulatory Spectrum DB', type: 'batch',   format: 'CSV',    description: 'Spectrum licence data from national regulator' },
        { id: 'ip-051-2', name: 'RF Planning Tool',      type: 'batch',   format: 'XML',    description: 'RF propagation model outputs from Atoll/ASSET' },
      ],
      outputPorts: [
        { id: 'op-051-1', name: 'Spectrum API',          type: 'api',     format: 'JSON',   description: 'Spectrum utilisation and compliance query API' },
        { id: 'op-051-2', name: 'RF Planning Dataset',   type: 'batch',   format: 'Parquet',description: 'Spectrum and coverage planning data lake export' },
      ],
      x: 4080, y: 680,
    },

    {
      id: 'dp-052', name: 'OSS/BSS Integration Events',
      domain: 'Network', owner: 'Integration Engineering',
      version: '2.3.0', status: 'active',
      sla: '99.9%', updateFrequency: 'Real-time',
      accessTier: 'standard',
      tags: ['network', 'OSS', 'BSS', 'integration', 'TMF', 'event-bus', 'EDA'],
      description: 'Event backbone capturing all OSS/BSS system integration events enabling event-driven architecture across the OSS/BSS stack. Aligned with TM Forum Event Model and Open API notification standards.',
      inputPorts: [
        { id: 'ip-052-1', name: 'OSS Event Bus',        type: 'streaming', format: 'Avro',   description: 'Events from OSS mediation and EMS systems' },
        { id: 'ip-052-2', name: 'BSS Event Bus',        type: 'streaming', format: 'Avro',   description: 'Events from BSS billing and CRM systems' },
      ],
      outputPorts: [
        { id: 'op-052-1', name: 'Integration Event API', type: 'api',     format: 'JSON',   description: 'OSS/BSS integration event query and replay API' },
        { id: 'op-052-2', name: 'Unified Event Stream',  type: 'streaming',format: 'Avro',  description: 'Unified cross-domain event stream for consumers' },
      ],
      x: 4080, y: 780,
    },

    {
      id: 'dp-053', name: 'Network Security Events',
      domain: 'Network', owner: 'Security Operations',
      version: '1.4.0', status: 'active',
      sla: '99.99%', updateFrequency: 'Real-time',
      accessTier: 'premium',
      tags: ['network', 'security', 'SIEM', 'DDoS', 'firewall', 'IDS', 'threat-intel'],
      description: 'Aggregated security event stream from network security infrastructure (firewalls, IDS/IPS, DDoS mitigation) feeding the telco SIEM. Supports threat detection and regulatory security reporting.',
      inputPorts: [
        { id: 'ip-053-1', name: 'Firewall Log Feed',    type: 'streaming', format: 'Syslog', description: 'Firewall and IDS/IPS log stream' },
        { id: 'ip-053-2', name: 'DDoS Event Feed',      type: 'streaming', format: 'JSON',   description: 'DDoS detection and mitigation events' },
      ],
      outputPorts: [
        { id: 'op-053-1', name: 'Security Event API',   type: 'api',       format: 'JSON',   description: 'Security event query API for SIEM integration' },
        { id: 'op-053-2', name: 'Threat Alert Stream',  type: 'streaming', format: 'Avro',   description: 'Real-time threat alert feed for SOC' },
      ],
      x: 4080, y: 880,
    },

    {
      id: 'dp-054', name: 'Edge Computing Resource Data',
      domain: 'Network', owner: 'Edge & Cloud Team',
      version: '1.0.0', status: 'draft',
      sla: '99.5%', updateFrequency: 'Real-time',
      accessTier: 'premium',
      tags: ['network', 'MEC', 'edge', '5G', 'ETSI', 'latency', 'cloud-native'],
      description: 'Resource inventory and performance data for Multi-access Edge Computing (MEC) nodes per ETSI MEC standards. Enables latency-aware workload placement and edge capacity management for 5G services.',
      inputPorts: [
        { id: 'ip-054-1', name: 'MEC Platform Telemetry', type: 'streaming',format: 'JSON', description: 'Resource utilisation from ETSI MEC platform' },
        { id: 'ip-054-2', name: 'Workload Events',         type: 'event',   format: 'JSON', description: 'Edge workload lifecycle events' },
      ],
      outputPorts: [
        { id: 'op-054-1', name: 'Edge Resource API',      type: 'api',      format: 'JSON', description: 'MEC resource availability and performance API' },
        { id: 'op-054-2', name: 'Edge Capacity Dataset',  type: 'batch',    format: 'Parquet',description: 'Edge capacity planning dataset' },
      ],
      x: 4080, y: 980,
    },

    // ── ANALYTICS DOMAIN – dp-055 to dp-062 ───────────────────

    {
      id: 'dp-055', name: 'Propensity-to-Buy Scoring',
      domain: 'Analytics', owner: 'AI & Data Science',
      version: '2.1.0', status: 'active',
      sla: '99.5%', updateFrequency: 'Daily',
      accessTier: 'premium',
      tags: ['analytics', 'ML', 'propensity', 'churn', 'upsell', 'NBO'],
      description: 'ML-derived propensity scores for upgrade, cross-sell, and churn events computed daily for the full subscriber base. Feature store integrates network quality, usage, and CRM interaction signals.',
      inputPorts: [
        { id: 'ip-055-1', name: 'Customer 360 Features', type: 'batch',   format: 'Parquet',description: 'Subscriber behavioural features' },
        { id: 'ip-055-2', name: 'CEM Quality Signals',   type: 'batch',   format: 'Parquet',description: 'Network quality experience features' },
      ],
      outputPorts: [
        { id: 'op-055-1', name: 'Propensity Score API',  type: 'api',     format: 'JSON',   description: 'Real-time propensity score lookup per subscriber' },
        { id: 'op-055-2', name: 'Score Dataset',         type: 'batch',   format: 'Parquet',description: 'Daily propensity score batch for campaign targeting' },
      ],
      x: 4580, y: 80,
    },

    {
      id: 'dp-056', name: 'Network Anomaly Detection',
      domain: 'Analytics', owner: 'Network Intelligence',
      version: '1.3.0', status: 'active',
      sla: '99.9%', updateFrequency: 'Real-time',
      accessTier: 'premium',
      tags: ['analytics', 'anomaly', 'ML', 'network', 'AIOps', 'ARIMA', 'isolation-forest'],
      description: 'ML-based anomaly detection on network KPI time series using isolation forest and ARIMA models. Identifies emerging faults, traffic anomalies, and security incidents before customer impact.',
      inputPorts: [
        { id: 'ip-056-1', name: 'Network KPI Stream',   type: 'streaming', format: 'Avro',   description: 'Real-time network performance KPIs' },
        { id: 'ip-056-2', name: 'Historical KPI Data',  type: 'batch',     format: 'Parquet',description: 'Historical KPI baseline for model training' },
      ],
      outputPorts: [
        { id: 'op-056-1', name: 'Anomaly Alert Stream', type: 'streaming', format: 'Avro',   description: 'Real-time anomaly alerts with confidence scores' },
        { id: 'op-056-2', name: 'Anomaly Report API',   type: 'api',       format: 'JSON',   description: 'Anomaly history and pattern query API' },
      ],
      x: 4580, y: 180,
    },

    {
      id: 'dp-057', name: 'Customer Lifetime Value Analytics',
      domain: 'Analytics', owner: 'AI & Data Science',
      version: '2.0.0', status: 'active',
      sla: '99.5%', updateFrequency: 'Weekly',
      accessTier: 'premium',
      tags: ['analytics', 'CLV', 'LTV', 'revenue', 'retention', 'ML'],
      description: 'Computes historical and predicted customer lifetime value using multi-model ensemble incorporating ARPU, tenure, churn probability, and service mix. Drives investment decisions in customer retention programmes.',
      inputPorts: [
        { id: 'ip-057-1', name: 'Revenue History',      type: 'batch',    format: 'Parquet',description: 'Historical revenue per subscriber from billing' },
        { id: 'ip-057-2', name: 'Churn Propensity',     type: 'batch',    format: 'Parquet',description: 'Churn probability scores from propensity models' },
      ],
      outputPorts: [
        { id: 'op-057-1', name: 'CLV Score API',        type: 'api',      format: 'JSON',   description: 'CLV score and decile query API' },
        { id: 'op-057-2', name: 'CLV Segment Dataset',  type: 'batch',    format: 'Parquet',description: 'CLV segmentation for marketing activation' },
      ],
      x: 4580, y: 280,
    },

    {
      id: 'dp-058', name: 'Social Media Sentiment Analytics',
      domain: 'Analytics', owner: 'Customer Intelligence',
      version: '1.2.0', status: 'active',
      sla: '99%', updateFrequency: 'Hourly',
      accessTier: 'standard',
      tags: ['analytics', 'sentiment', 'NLP', 'social-media', 'brand', 'NPS'],
      description: 'NLP-based sentiment analysis of brand mentions across social media platforms. Identifies service quality complaints, outage impacts, and brand perception trends correlated with network events.',
      inputPorts: [
        { id: 'ip-058-1', name: 'Social Media API',     type: 'api',      format: 'JSON',   description: 'Social media mentions via platform APIs' },
        { id: 'ip-058-2', name: 'Review Feed',          type: 'batch',    format: 'JSON',   description: 'App store and review site ratings' },
      ],
      outputPorts: [
        { id: 'op-058-1', name: 'Sentiment Score API',  type: 'api',      format: 'JSON',   description: 'Brand sentiment score and trend query API' },
        { id: 'op-058-2', name: 'Sentiment Dataset',    type: 'batch',    format: 'Parquet',description: 'Daily sentiment aggregations for BI' },
      ],
      x: 4580, y: 380,
    },

    {
      id: 'dp-059', name: 'Predictive Maintenance Analytics',
      domain: 'Analytics', owner: 'Network Intelligence',
      version: '1.5.0', status: 'active',
      sla: '99.5%', updateFrequency: 'Daily',
      accessTier: 'premium',
      tags: ['analytics', 'predictive-maintenance', 'ML', 'AIOps', 'network', 'BTS', 'MTTR'],
      description: 'ML models predicting network equipment failures (BTS, transmission, CPE) before outage occurrence using degradation indicators. Reduces MTTR and enables proactive field maintenance dispatch.',
      inputPorts: [
        { id: 'ip-059-1', name: 'Equipment Telemetry',  type: 'batch',    format: 'Parquet',description: 'Hardware counter time series from network elements' },
        { id: 'ip-059-2', name: 'Fault History',        type: 'batch',    format: 'Parquet',description: 'Historical fault and maintenance records' },
      ],
      outputPorts: [
        { id: 'op-059-1', name: 'Failure Prediction API', type: 'api',    format: 'JSON',   description: 'Failure probability and time-to-failure API' },
        { id: 'op-059-2', name: 'Maintenance Schedule',   type: 'batch',  format: 'CSV',    description: 'Proactive maintenance work order dataset' },
      ],
      x: 4580, y: 480,
    },

    {
      id: 'dp-060', name: 'Real-time Event Streaming Analytics',
      domain: 'Analytics', owner: 'Data Platform',
      version: '2.2.0', status: 'active',
      sla: '99.9%', updateFrequency: 'Real-time',
      accessTier: 'standard',
      tags: ['analytics', 'streaming', 'Kafka', 'Flink', 'real-time', 'CEP', 'event-driven'],
      description: 'Real-time complex event processing (CEP) platform consuming multiple telco event streams. Enables sub-second insight generation for fraud detection, personalisation, and network automation use cases.',
      inputPorts: [
        { id: 'ip-060-1', name: 'Network Event Stream',  type: 'streaming',format: 'Avro',   description: 'Network events from Kafka cluster' },
        { id: 'ip-060-2', name: 'BSS Event Stream',      type: 'streaming',format: 'Avro',   description: 'BSS transaction events from event bus' },
      ],
      outputPorts: [
        { id: 'op-060-1', name: 'CEP Alert Stream',      type: 'streaming',format: 'Avro',   description: 'Complex event pattern alerts for consumers' },
        { id: 'op-060-2', name: 'Streaming KPI API',     type: 'api',      format: 'JSON',   description: 'Real-time KPI query API with windowed aggregations' },
      ],
      x: 4580, y: 580,
    },

    {
      id: 'dp-061', name: 'Market Share & Competition Analytics',
      domain: 'Analytics', owner: 'Strategy & Insights',
      version: '1.1.0', status: 'active',
      sla: '99%', updateFrequency: 'Monthly',
      accessTier: 'standard',
      tags: ['analytics', 'market-share', 'competitive', 'MNP', 'churn', 'strategy'],
      description: 'Market share estimates and competitive intelligence derived from mobile number portability (MNP) records, GSMA data, and third-party market research. Informs commercial strategy and ARPU benchmarking.',
      inputPorts: [
        { id: 'ip-061-1', name: 'MNP Database',          type: 'batch',   format: 'CSV',    description: 'Monthly MNP port-in/out records' },
        { id: 'ip-061-2', name: 'Market Research Feed',  type: 'batch',   format: 'Excel',  description: 'Third-party market research reports' },
      ],
      outputPorts: [
        { id: 'op-061-1', name: 'Market Share API',      type: 'api',     format: 'JSON',   description: 'Market share trend and segment query API' },
        { id: 'op-061-2', name: 'Competition Dataset',   type: 'batch',   format: 'Parquet',description: 'Competitive intelligence dataset for strategy BI' },
      ],
      x: 4580, y: 680,
    },

    {
      id: 'dp-062', name: 'Campaign Performance Analytics',
      domain: 'Analytics', owner: 'Marketing Analytics',
      version: '1.8.0', status: 'active',
      sla: '99.5%', updateFrequency: 'Daily',
      accessTier: 'standard',
      tags: ['analytics', 'campaign', 'ROI', 'conversion', 'A/B-test', 'marketing'],
      description: 'Tracks campaign execution and performance metrics including reach, conversion, uplift, and ROI across digital, outbound, and in-store channels. Feeds marketing mix optimisation models.',
      inputPorts: [
        { id: 'ip-062-1', name: 'Campaign Manager Feed', type: 'batch',   format: 'CSV',    description: 'Campaign execution data from marketing automation' },
        { id: 'ip-062-2', name: 'Conversion Events',     type: 'streaming',format: 'Avro',  description: 'Real-time product purchase/upgrade conversion events' },
      ],
      outputPorts: [
        { id: 'op-062-1', name: 'Campaign KPI API',      type: 'api',     format: 'JSON',   description: 'Campaign performance metrics query API' },
        { id: 'op-062-2', name: 'Campaign Dataset',      type: 'batch',   format: 'Parquet',description: 'Detailed campaign analytics dataset for BI' },
      ],
      x: 4580, y: 780,
    },

    // ── FINANCE DOMAIN – dp-063 to dp-070 ─────────────────────

    {
      id: 'dp-063', name: 'Invoice & Bill Data',
      domain: 'Finance', owner: 'Finance Data Office',
      version: '3.5.0', status: 'active',
      sla: '99.99%', updateFrequency: 'Daily',
      accessTier: 'standard',
      tags: ['finance', 'TMF678', 'invoice', 'bill', 'billing', 'BSS'],
      description: 'Structured invoice and bill records per TMF678 Customer Bill Management API covering retail, wholesale, and enterprise segments. Feeds accounts receivable and revenue assurance processes.',
      inputPorts: [
        { id: 'ip-063-1', name: 'Billing System Output', type: 'batch',   format: 'CSV',    description: 'Billing cycle output from rating and billing engine' },
        { id: 'ip-063-2', name: 'Revenue Adjustments',  type: 'api',     format: 'JSON',   description: 'Credit notes and adjustments from customer care' },
      ],
      outputPorts: [
        { id: 'op-063-1', name: 'Bill API (TMF678)',    type: 'api',      format: 'JSON',   description: 'TMF678 customer bill query API' },
        { id: 'op-063-2', name: 'Invoice Dataset',      type: 'batch',    format: 'Parquet',description: 'Invoice data lake export for analytics' },
      ],
      x: 5080, y: 80,
    },

    {
      id: 'dp-064', name: 'Payment Events & Transactions',
      domain: 'Finance', owner: 'Finance Data Office',
      version: '2.4.0', status: 'active',
      sla: '99.99%', updateFrequency: 'Real-time',
      accessTier: 'standard',
      tags: ['finance', 'payment', 'PCI-DSS', 'transaction', 'direct-debit', 'card'],
      description: 'Real-time payment transaction events from all payment channels (direct debit, card, cash, mobile money) with PCI-DSS compliant tokenisation. Feeds cash collection and fraud detection systems.',
      inputPorts: [
        { id: 'ip-064-1', name: 'Payment Gateway Feed', type: 'streaming', format: 'JSON',   description: 'Real-time payment authorisation events' },
        { id: 'ip-064-2', name: 'Bank Statement Feed',  type: 'batch',    format: 'CSV',    description: 'Bank statement reconciliation files' },
      ],
      outputPorts: [
        { id: 'op-064-1', name: 'Payment Event Stream', type: 'streaming', format: 'Avro',   description: 'Real-time payment event stream for AR systems' },
        { id: 'op-064-2', name: 'Payment API',          type: 'api',       format: 'JSON',   description: 'Payment status and history query API' },
      ],
      x: 5080, y: 180,
    },

    {
      id: 'dp-065', name: 'Credit Risk Scoring',
      domain: 'Finance', owner: 'Risk Management',
      version: '1.6.0', status: 'active',
      sla: '99.5%', updateFrequency: 'Daily',
      accessTier: 'premium',
      tags: ['finance', 'credit-risk', 'scoring', 'ML', 'bureau', 'IFRS9'],
      description: 'ML-based credit risk scores for new subscriber acquisition and credit limit management. Integrates bureau data, payment history, and usage signals. Compliant with IFRS 9 expected credit loss requirements.',
      inputPorts: [
        { id: 'ip-065-1', name: 'Payment History',      type: 'batch',    format: 'Parquet',description: 'Customer payment behaviour history' },
        { id: 'ip-065-2', name: 'Credit Bureau Data',   type: 'batch',    format: 'CSV',    description: 'Bureau credit reports via secure file transfer' },
      ],
      outputPorts: [
        { id: 'op-065-1', name: 'Credit Score API',     type: 'api',      format: 'JSON',   description: 'Real-time credit risk score for onboarding' },
        { id: 'op-065-2', name: 'Risk Score Dataset',   type: 'batch',    format: 'Parquet',description: 'Batch credit scores for portfolio management' },
      ],
      x: 5080, y: 280,
    },

    {
      id: 'dp-066', name: 'Regulatory Reporting Data',
      domain: 'Finance', owner: 'Legal & Compliance',
      version: '2.0.0', status: 'active',
      sla: '99.99%', updateFrequency: 'Monthly',
      accessTier: 'premium',
      tags: ['finance', 'regulatory', 'reporting', 'NRA', 'GSMA', 'compliance', 'audit'],
      description: 'Aggregated financial and operational data compiled for national regulatory authority (NRA) submissions including market share, interconnect, and Universal Service Obligation (USO) reporting.',
      inputPorts: [
        { id: 'ip-066-1', name: 'Financial GL Data',    type: 'batch',    format: 'CSV',    description: 'General ledger extracts from ERP system' },
        { id: 'ip-066-2', name: 'Operational Metrics',  type: 'batch',    format: 'CSV',    description: 'Operational KPIs from OSS/BSS systems' },
      ],
      outputPorts: [
        { id: 'op-066-1', name: 'Regulatory Report API', type: 'api',     format: 'JSON',   description: 'Regulatory submission data query API' },
        { id: 'op-066-2', name: 'Compliance Dataset',    type: 'batch',   format: 'Excel',  description: 'Regulatory report packages for NRA submission' },
      ],
      x: 5080, y: 380,
    },

    {
      id: 'dp-067', name: 'Financial Reconciliation Data',
      domain: 'Finance', owner: 'Finance Data Office',
      version: '2.1.0', status: 'active',
      sla: '99.9%', updateFrequency: 'Daily',
      accessTier: 'standard',
      tags: ['finance', 'reconciliation', 'GL', 'ERP', 'revenue-assurance', 'audit'],
      description: 'Cross-system financial reconciliation data comparing network usage, rating, billing, and general ledger figures. Identifies leakage and discrepancies for revenue assurance and audit purposes.',
      inputPorts: [
        { id: 'ip-067-1', name: 'Billing System Data',  type: 'batch',    format: 'CSV',    description: 'Billed revenue extracts by product and segment' },
        { id: 'ip-067-2', name: 'ERP GL Extract',       type: 'batch',    format: 'CSV',    description: 'General ledger financial data from SAP/Oracle' },
      ],
      outputPorts: [
        { id: 'op-067-1', name: 'Reconciliation API',   type: 'api',      format: 'JSON',   description: 'Reconciliation summary and exception query API' },
        { id: 'op-067-2', name: 'Exception Dataset',    type: 'batch',    format: 'Parquet',description: 'Financial exception data for audit workflows' },
      ],
      x: 5080, y: 480,
    },

    {
      id: 'dp-068', name: 'Interconnect Cost Management',
      domain: 'Finance', owner: 'Wholesale Finance',
      version: '1.9.0', status: 'active',
      sla: '99.9%', updateFrequency: 'Daily',
      accessTier: 'standard',
      tags: ['finance', 'interconnect', 'wholesale', 'settlement', 'roaming', 'GSMA TAP'],
      description: 'Manages voice and data interconnect costs with national and international carriers including TAP3 roaming settlement files. Feeds cost allocation models and partner settlement billing.',
      inputPorts: [
        { id: 'ip-068-1', name: 'TAP3 Roaming Files',  type: 'batch',    format: 'ASN.1',  description: 'GSMA TAP3 transferred account procedure files' },
        { id: 'ip-068-2', name: 'Interconnect CDRs',   type: 'batch',    format: 'CSV',    description: 'National interconnect CDRs from mediation' },
      ],
      outputPorts: [
        { id: 'op-068-1', name: 'Interconnect Cost API', type: 'api',    format: 'JSON',   description: 'Interconnect cost allocation query API' },
        { id: 'op-068-2', name: 'Settlement Dataset',    type: 'batch',  format: 'Parquet',description: 'Interconnect settlement data for finance systems' },
      ],
      x: 5080, y: 580,
    },

    {
      id: 'dp-069', name: 'Cost Allocation & Profitability Analytics',
      domain: 'Finance', owner: 'Finance Data Office',
      version: '1.4.0', status: 'active',
      sla: '99.5%', updateFrequency: 'Monthly',
      accessTier: 'standard',
      tags: ['finance', 'cost-allocation', 'profitability', 'EBITDA', 'segment', 'ABC'],
      description: 'Activity-based cost allocation (ABC) model distributing network, IT, and overhead costs across products, segments, and customers. Produces customer-level and product-level profitability P&L views.',
      inputPorts: [
        { id: 'ip-069-1', name: 'ERP Cost Centre Data', type: 'batch',   format: 'CSV',    description: 'Cost centre actuals from ERP general ledger' },
        { id: 'ip-069-2', name: 'Revenue Attribution',  type: 'batch',   format: 'Parquet',description: 'Product and customer revenue from billing analytics' },
      ],
      outputPorts: [
        { id: 'op-069-1', name: 'Profitability API',    type: 'api',     format: 'JSON',   description: 'Customer and product profitability query API' },
        { id: 'op-069-2', name: 'P&L Dataset',          type: 'batch',   format: 'Parquet',description: 'Cost allocation and P&L dataset for finance BI' },
      ],
      x: 5080, y: 680,
    },

    {
      id: 'dp-070', name: 'Dunning & Debt Management',
      domain: 'Finance', owner: 'Collections',
      version: '1.2.0', status: 'active',
      sla: '99.9%', updateFrequency: 'Daily',
      accessTier: 'standard',
      tags: ['finance', 'dunning', 'collections', 'debt', 'AR', 'write-off'],
      description: 'Manages the dunning workflow and debt lifecycle from initial overdue notification through collections, suspension, and write-off stages. Integrates credit risk scores to optimise collection strategies.',
      inputPorts: [
        { id: 'ip-070-1', name: 'Aged Debt Report',     type: 'batch',    format: 'CSV',    description: 'Daily aged debt extract from billing system' },
        { id: 'ip-070-2', name: 'Payment Events',       type: 'streaming',format: 'Avro',   description: 'Real-time payment events to update debt status' },
      ],
      outputPorts: [
        { id: 'op-070-1', name: 'Dunning Status API',   type: 'api',      format: 'JSON',   description: 'Customer debt status and dunning stage query API' },
        { id: 'op-070-2', name: 'Collections Dataset',  type: 'batch',    format: 'Parquet',description: 'Collections performance dataset for management BI' },
      ],
      x: 5080, y: 780,
    },

    // ── PARTNER DOMAIN – dp-071 to dp-076 ─────────────────────

    {
      id: 'dp-071', name: 'MVNO Partner Management',
      domain: 'Partner', owner: 'Wholesale Team',
      version: '2.3.0', status: 'active',
      sla: '99.9%', updateFrequency: 'Daily',
      accessTier: 'standard',
      tags: ['partner', 'MVNO', 'wholesale', 'settlement', 'TMF702', 'MVNE'],
      description: 'Manages MVNO partner profiles, rate cards, usage aggregation, and monthly settlement per TMF702 Partner Management standards. Supports full MVNO and light MVNO operational models.',
      inputPorts: [
        { id: 'ip-071-1', name: 'MVNO Usage CDRs',      type: 'batch',    format: 'CSV',    description: 'MVNO subscriber usage records from mediation' },
        { id: 'ip-071-2', name: 'MVNO Partner Portal',  type: 'api',      format: 'JSON',   description: 'Partner self-service portal event feed' },
      ],
      outputPorts: [
        { id: 'op-071-1', name: 'MVNO Settlement API',  type: 'api',      format: 'JSON',   description: 'MVNO usage and settlement query API' },
        { id: 'op-071-2', name: 'Settlement Dataset',   type: 'batch',    format: 'Parquet',description: 'Monthly MVNO settlement data for finance' },
      ],
      x: 5580, y: 80,
    },

    {
      id: 'dp-072', name: 'Content Provider Revenue Share',
      domain: 'Partner', owner: 'Partner Business',
      version: '1.7.0', status: 'active',
      sla: '99.5%', updateFrequency: 'Daily',
      accessTier: 'standard',
      tags: ['partner', 'content', 'revenue-share', 'VAS', 'settlement', 'DCB'],
      description: 'Tracks content provider service usage and computes revenue share splits for VAS and direct carrier billing (DCB) partners. Automates partner settlement and dispute management workflows.',
      inputPorts: [
        { id: 'ip-072-1', name: 'VAS Usage Data',       type: 'batch',    format: 'CSV',    description: 'Value-added service usage aggregates' },
        { id: 'ip-072-2', name: 'DCB Transaction Feed',  type: 'batch',   format: 'CSV',    description: 'Direct carrier billing transaction records' },
      ],
      outputPorts: [
        { id: 'op-072-1', name: 'Revenue Share API',    type: 'api',      format: 'JSON',   description: 'Partner revenue share statement query API' },
        { id: 'op-072-2', name: 'Settlement Report',    type: 'batch',    format: 'Excel',  description: 'Monthly revenue share settlement reports' },
      ],
      x: 5580, y: 180,
    },

    {
      id: 'dp-073', name: 'API Partner Gateway Events',
      domain: 'Partner', owner: 'API Platform Team',
      version: '2.0.0', status: 'active',
      sla: '99.99%', updateFrequency: 'Real-time',
      accessTier: 'standard',
      tags: ['partner', 'TMF732', 'API-gateway', 'monetisation', 'GSMA OGW', 'developer'],
      description: 'API usage, rate limiting, and monetisation events from the telco API gateway per TMF732 API Management API and GSMA Open Gateway standards. Enables API product analytics and partner invoicing.',
      inputPorts: [
        { id: 'ip-073-1', name: 'API Gateway Logs',     type: 'streaming', format: 'JSON',   description: 'API call logs and rate limit events from gateway' },
        { id: 'ip-073-2', name: 'Partner API Keys',     type: 'batch',    format: 'JSON',   description: 'API key and subscription data from developer portal' },
      ],
      outputPorts: [
        { id: 'op-073-1', name: 'API Usage API',        type: 'api',       format: 'JSON',   description: 'Partner API usage metrics and quota query API' },
        { id: 'op-073-2', name: 'API Monetisation Feed',type: 'batch',     format: 'Parquet',description: 'API usage billing data for partner invoicing' },
      ],
      x: 5580, y: 280,
    },

    {
      id: 'dp-074', name: 'Wholesale Capacity Management',
      domain: 'Partner', owner: 'Wholesale Team',
      version: '1.4.0', status: 'active',
      sla: '99.9%', updateFrequency: 'Daily',
      accessTier: 'standard',
      tags: ['partner', 'wholesale', 'capacity', 'leased-line', 'dark-fibre', 'IRU'],
      description: 'Manages wholesale capacity products (leased lines, dark fibre, IRU) sold to enterprise and carrier customers. Tracks utilisation against contracted capacity for SLA management and capacity planning.',
      inputPorts: [
        { id: 'ip-074-1', name: 'Wholesale Order Feed',  type: 'api',      format: 'JSON',   description: 'Wholesale product orders and amendments' },
        { id: 'ip-074-2', name: 'Network Utilisation',   type: 'batch',    format: 'Parquet',description: 'Link utilisation data from transport network' },
      ],
      outputPorts: [
        { id: 'op-074-1', name: 'Capacity Management API', type: 'api',    format: 'JSON',   description: 'Wholesale capacity and utilisation query API' },
        { id: 'op-074-2', name: 'Capacity Dataset',        type: 'batch',  format: 'Parquet',description: 'Wholesale capacity dataset for planning' },
      ],
      x: 5580, y: 380,
    },

    {
      id: 'dp-075', name: 'Interconnect Quality Analytics',
      domain: 'Partner', owner: 'Wholesale Team',
      version: '1.3.0', status: 'active',
      sla: '99.9%', updateFrequency: 'Hourly',
      accessTier: 'standard',
      tags: ['partner', 'interconnect', 'quality', 'voice', 'ASR', 'ACD', 'NER', 'CLI'],
      description: 'Voice interconnect quality analytics covering ASR, ACD, NER, and CLI spoofing metrics per route and partner. Supports interconnect partner SLA management and fraud flagging.',
      inputPorts: [
        { id: 'ip-075-1', name: 'Voice CDR Feed',       type: 'batch',    format: 'CSV',    description: 'Interconnect voice CDRs from mediation system' },
        { id: 'ip-075-2', name: 'Alarm Feed',           type: 'streaming',format: 'Avro',   description: 'Voice gateway quality alarms' },
      ],
      outputPorts: [
        { id: 'op-075-1', name: 'Route Quality API',    type: 'api',      format: 'JSON',   description: 'Per-route quality metrics query API' },
        { id: 'op-075-2', name: 'Quality Report',       type: 'batch',    format: 'Parquet',description: 'Interconnect quality analytics dataset' },
      ],
      x: 5580, y: 480,
    },

    {
      id: 'dp-076', name: 'Regulatory Compliance & Audit Data',
      domain: 'Partner', owner: 'Legal & Compliance',
      version: '1.0.0', status: 'active',
      sla: '99.99%', updateFrequency: 'Monthly',
      accessTier: 'premium',
      tags: ['partner', 'compliance', 'audit', 'LI', 'GDPR', 'NIS2', 'regulatory'],
      description: 'Consolidated compliance and audit data for regulatory obligations including lawful interception (LI) capability reporting, NIS2 incident reporting, and data protection impact assessments (DPIA).',
      inputPorts: [
        { id: 'ip-076-1', name: 'Compliance System Feed', type: 'batch',  format: 'CSV',    description: 'Compliance control status from GRC platform' },
        { id: 'ip-076-2', name: 'Audit Log Aggregator',   type: 'batch',  format: 'JSON',   description: 'System audit logs for compliance review' },
      ],
      outputPorts: [
        { id: 'op-076-1', name: 'Compliance API',         type: 'api',    format: 'JSON',   description: 'Compliance status and audit evidence query API' },
        { id: 'op-076-2', name: 'Audit Dataset',          type: 'batch',  format: 'Parquet',description: 'Audit data export for external auditors' },
      ],
      x: 5580, y: 580,
    },

    // ── OPERATIONS DOMAIN – dp-077 to dp-083 ──────────────────

    {
      id: 'dp-077', name: 'Field Force Management',
      domain: 'Operations', owner: 'Field Operations',
      version: '2.0.0', status: 'active',
      sla: '99.5%', updateFrequency: 'Real-time',
      accessTier: 'standard',
      tags: ['operations', 'field-force', 'workforce', 'scheduling', 'SFM', 'ITIL'],
      description: 'Manages field technician work orders, scheduling, and completion tracking for network installation, maintenance, and fault clearance activities. Integrates with GPS dispatch and ERP systems.',
      inputPorts: [
        { id: 'ip-077-1', name: 'WFM System Feed',      type: 'api',      format: 'JSON',   description: 'Work orders from workforce management system' },
        { id: 'ip-077-2', name: 'GPS Tracking Feed',    type: 'streaming',format: 'JSON',   description: 'Real-time technician location from mobile app' },
      ],
      outputPorts: [
        { id: 'op-077-1', name: 'Field Force API',      type: 'api',      format: 'JSON',   description: 'Work order status and technician schedule query API' },
        { id: 'op-077-2', name: 'Field Analytics Feed', type: 'batch',    format: 'Parquet',description: 'Field force productivity dataset for operations BI' },
      ],
      x: 6080, y: 80,
    },

    {
      id: 'dp-078', name: 'Customer Complaint Management',
      domain: 'Operations', owner: 'Customer Operations',
      version: '1.5.0', status: 'active',
      sla: '99.9%', updateFrequency: 'Real-time',
      accessTier: 'standard',
      tags: ['operations', 'complaint', 'TMF656', 'CRM', 'NPS', 'CSAT', 'VOC'],
      description: 'Captures and tracks formal customer complaints through resolution aligned with TMF656 and regulatory complaint-handling obligations. Feeds voice-of-customer (VOC) analytics and NPS correlation models.',
      inputPorts: [
        { id: 'ip-078-1', name: 'CRM Complaint Feed',   type: 'api',      format: 'JSON',   description: 'Formal complaint records from CRM system' },
        { id: 'ip-078-2', name: 'Regulatory Portal',    type: 'batch',    format: 'CSV',    description: 'Regulator-forwarded complaints from ombudsman' },
      ],
      outputPorts: [
        { id: 'op-078-1', name: 'Complaint API',        type: 'api',      format: 'JSON',   description: 'Complaint status and resolution query API' },
        { id: 'op-078-2', name: 'VOC Analytics Feed',   type: 'batch',    format: 'Parquet',description: 'Complaint analytics dataset for quality management' },
      ],
      x: 6080, y: 180,
    },

    {
      id: 'dp-079', name: 'Change Management Events',
      domain: 'Operations', owner: 'IT Operations',
      version: '1.3.0', status: 'active',
      sla: '99.9%', updateFrequency: 'Real-time',
      accessTier: 'standard',
      tags: ['operations', 'change-management', 'ITIL', 'TMF', 'CAB', 'RFC', 'ITSM'],
      description: 'Tracks IT and network change requests from initiation through CAB approval to implementation and post-implementation review per ITIL v4 Change Enablement and TMF NGOSS principles.',
      inputPorts: [
        { id: 'ip-079-1', name: 'ITSM Change Feed',     type: 'api',      format: 'JSON',   description: 'Change requests from ServiceNow/Remedy' },
        { id: 'ip-079-2', name: 'CI Impact Feed',       type: 'batch',    format: 'JSON',   description: 'CI dependency impact assessments from CMDB' },
      ],
      outputPorts: [
        { id: 'op-079-1', name: 'Change Event API',     type: 'api',      format: 'JSON',   description: 'Change record status and schedule query API' },
        { id: 'op-079-2', name: 'Change Stream',        type: 'streaming',format: 'Avro',   description: 'Real-time change approval and implementation events' },
      ],
      x: 6080, y: 280,
    },

    {
      id: 'dp-080', name: 'IT Asset & Configuration Management',
      domain: 'Operations', owner: 'IT Operations',
      version: '2.2.0', status: 'active',
      sla: '99.9%', updateFrequency: 'Daily',
      accessTier: 'standard',
      tags: ['operations', 'CMDB', 'ITIL', 'asset', 'configuration', 'ServiceNow', 'CMS'],
      description: 'Configuration Management Database (CMDB) covering all IT and network configuration items, their attributes, and relationships. Single source of truth for impact analysis and change planning.',
      inputPorts: [
        { id: 'ip-080-1', name: 'Discovery Tool Feed',  type: 'batch',    format: 'JSON',   description: 'Auto-discovered CIs from network and server discovery' },
        { id: 'ip-080-2', name: 'Manual CI Updates',    type: 'api',      format: 'JSON',   description: 'Manual CI submissions from engineering teams' },
      ],
      outputPorts: [
        { id: 'op-080-1', name: 'CMDB API',             type: 'api',      format: 'JSON',   description: 'CI and relationship query API for ITSM integration' },
        { id: 'op-080-2', name: 'CI Snapshot Dataset',  type: 'batch',    format: 'Parquet',description: 'Daily CMDB snapshot for analytics and reporting' },
      ],
      x: 6080, y: 380,
    },

    {
      id: 'dp-081', name: 'Workforce & HR Analytics',
      domain: 'Operations', owner: 'People Analytics',
      version: '1.1.0', status: 'active',
      sla: '99%', updateFrequency: 'Weekly',
      accessTier: 'standard',
      tags: ['operations', 'HR', 'workforce', 'headcount', 'attrition', 'people-analytics'],
      description: 'Aggregated and anonymised workforce analytics covering headcount, attrition, productivity, and skills inventory. Enables workforce planning aligned with network and business growth strategies.',
      inputPorts: [
        { id: 'ip-081-1', name: 'HRIS System Feed',     type: 'batch',    format: 'CSV',    description: 'Employee data from HR information system' },
        { id: 'ip-081-2', name: 'Performance Data',     type: 'batch',    format: 'CSV',    description: 'Anonymised performance review data' },
      ],
      outputPorts: [
        { id: 'op-081-1', name: 'Workforce KPI API',    type: 'api',      format: 'JSON',   description: 'Anonymised workforce analytics query API' },
        { id: 'op-081-2', name: 'HR Analytics Dataset', type: 'batch',    format: 'Parquet',description: 'Workforce analytics dataset for HR BI tools' },
      ],
      x: 6080, y: 480,
    },

    {
      id: 'dp-082', name: 'Energy Consumption & Sustainability',
      domain: 'Operations', owner: 'Infrastructure & Facilities',
      version: '1.0.0', status: 'active',
      sla: '99%', updateFrequency: 'Hourly',
      accessTier: 'free',
      tags: ['operations', 'energy', 'sustainability', 'ESG', 'carbon', 'GSMA', 'Green'],
      description: 'Collects and aggregates energy consumption data from network sites, data centres, and offices. Computes carbon intensity metrics aligned with GSMA Green Future Network targets and ESG reporting standards.',
      inputPorts: [
        { id: 'ip-082-1', name: 'Smart Meter Feed',     type: 'streaming', format: 'JSON',   description: 'Real-time energy consumption from smart meters' },
        { id: 'ip-082-2', name: 'BMS Data Feed',        type: 'batch',    format: 'CSV',    description: 'Building management system energy data' },
      ],
      outputPorts: [
        { id: 'op-082-1', name: 'Energy API',           type: 'api',       format: 'JSON',   description: 'Energy consumption and carbon footprint query API' },
        { id: 'op-082-2', name: 'ESG Report Dataset',   type: 'batch',     format: 'Parquet',description: 'Energy and carbon dataset for ESG reporting' },
      ],
      x: 6080, y: 580,
    },

    {
      id: 'dp-083', name: 'Incident & Problem Management',
      domain: 'Operations', owner: 'Network Operations Centre',
      version: '2.5.0', status: 'active',
      sla: '99.99%', updateFrequency: 'Real-time',
      accessTier: 'standard',
      tags: ['operations', 'TMF656', 'incident', 'problem', 'ITIL', 'NOC', 'MTTR'],
      description: 'End-to-end incident and problem management aligned with TMF656 Service Problem Management API and ITIL v4. Correlates alarms, customer reports, and field events into managed incidents with automated severity classification.',
      inputPorts: [
        { id: 'ip-083-1', name: 'NOC Alarm Feed',       type: 'streaming', format: 'Avro',   description: 'Correlated alarm events from NOC tooling' },
        { id: 'ip-083-2', name: 'Customer Impact Feed', type: 'streaming', format: 'Avro',   description: 'Customer complaint volume spikes indicating incidents' },
      ],
      outputPorts: [
        { id: 'op-083-1', name: 'Incident API (TMF656)', type: 'api',     format: 'JSON',   description: 'TMF656 incident status and history query API' },
        { id: 'op-083-2', name: 'Incident Event Stream', type: 'streaming',format: 'Avro',  description: 'Real-time incident state change events for consumers' },
      ],
      x: 6080, y: 680,
    },

  ];

  // ─────────────────────────────────────────────────────────────
  // 30 Data Product Chain Connections
  // ─────────────────────────────────────────────────────────────
  const initialConnections = [
    // Subscriber Master → downstream
    { id: 'conn-001', fromProductId: 'dp-001', fromPortId: 'op-001-1', toProductId: 'dp-005', toPortId: 'ip-005-2', label: '' },
    { id: 'conn-002', fromProductId: 'dp-001', fromPortId: 'op-001-1', toProductId: 'dp-010', toPortId: 'ip-010-1', label: '' },
    { id: 'conn-003', fromProductId: 'dp-001', fromPortId: 'op-001-1', toProductId: 'dp-017', toPortId: 'ip-017-2', label: '' },

    // Product Catalog → downstream
    { id: 'conn-004', fromProductId: 'dp-002', fromPortId: 'op-002-1', toProductId: 'dp-006', toPortId: 'ip-006-2', label: '' },

    // Network Resource Inventory → downstream
    { id: 'conn-005', fromProductId: 'dp-003', fromPortId: 'op-003-1', toProductId: 'dp-007', toPortId: 'ip-007-2', label: '' },
    { id: 'conn-006', fromProductId: 'dp-003', fromPortId: 'op-003-1', toProductId: 'dp-012', toPortId: 'ip-012-2', label: '' },

    // Usage Records / CDR → downstream
    { id: 'conn-007', fromProductId: 'dp-004', fromPortId: 'op-004-1', toProductId: 'dp-013', toPortId: 'ip-013-1', label: '' },
    { id: 'conn-008', fromProductId: 'dp-004', fromPortId: 'op-004-1', toProductId: 'dp-017', toPortId: 'ip-017-1', label: '' },
    { id: 'conn-009', fromProductId: 'dp-004', fromPortId: 'op-004-2', toProductId: 'dp-015', toPortId: 'ip-015-2', label: '' },

    // Customer Account & Billing → downstream
    { id: 'conn-010', fromProductId: 'dp-005', fromPortId: 'op-005-1', toProductId: 'dp-010', toPortId: 'ip-010-2', label: '' },
    { id: 'conn-011', fromProductId: 'dp-005', fromPortId: 'op-005-1', toProductId: 'dp-013', toPortId: 'ip-013-3', label: '' },

    // Product Inventory → downstream
    { id: 'conn-012', fromProductId: 'dp-006', fromPortId: 'op-006-1', toProductId: 'dp-007', toPortId: 'ip-007-3', label: '' },
    { id: 'conn-013', fromProductId: 'dp-006', fromPortId: 'op-006-1', toProductId: 'dp-010', toPortId: 'ip-010-3', label: '' },
    { id: 'conn-014', fromProductId: 'dp-006', fromPortId: 'op-006-1', toProductId: 'dp-013', toPortId: 'ip-013-2', label: '' },

    // Service Inventory → downstream
    { id: 'conn-015', fromProductId: 'dp-007', fromPortId: 'op-007-1', toProductId: 'dp-011', toPortId: 'ip-011-1', label: '' },

    // Network Performance & KPI → downstream
    { id: 'conn-016', fromProductId: 'dp-008', fromPortId: 'op-008-1', toProductId: 'dp-011', toPortId: 'ip-011-2', label: '' },
    { id: 'conn-017', fromProductId: 'dp-008', fromPortId: 'op-008-1', toProductId: 'dp-012', toPortId: 'ip-012-1', label: '' },

    // Alarm & Event Management → downstream
    { id: 'conn-018', fromProductId: 'dp-009', fromPortId: 'op-009-2', toProductId: 'dp-012', toPortId: 'ip-012-3', label: '' },

    // Customer 360 → downstream
    { id: 'conn-019', fromProductId: 'dp-010', fromPortId: 'op-010-1', toProductId: 'dp-015', toPortId: 'ip-015-1', label: '' },
    { id: 'conn-020', fromProductId: 'dp-010', fromPortId: 'op-010-3', toProductId: 'dp-016', toPortId: 'ip-016-3', label: '' },

    // Service Quality & SLA → downstream
    { id: 'conn-021', fromProductId: 'dp-011', fromPortId: 'op-011-1', toProductId: 'dp-016', toPortId: 'ip-016-1', label: '' },

    // RAN & Cell Performance → downstream
    { id: 'conn-022', fromProductId: 'dp-012', fromPortId: 'op-012-1', toProductId: 'dp-016', toPortId: 'ip-016-2', label: '' },
    { id: 'conn-023', fromProductId: 'dp-012', fromPortId: 'op-012-2', toProductId: 'dp-020', toPortId: 'ip-020-1', label: '' },

    // Revenue Assurance → downstream
    { id: 'conn-024', fromProductId: 'dp-013', fromPortId: 'op-013-1', toProductId: 'dp-015', toPortId: 'ip-015-3', label: '' },
    { id: 'conn-025', fromProductId: 'dp-013', fromPortId: 'op-013-1', toProductId: 'dp-018', toPortId: 'ip-018-2', label: '' },
    { id: 'conn-026', fromProductId: 'dp-013', fromPortId: 'op-013-2', toProductId: 'dp-017', toPortId: 'ip-017-3', label: '' },

    // Roaming & Interconnect → downstream
    { id: 'conn-027', fromProductId: 'dp-014', fromPortId: 'op-014-1', toProductId: 'dp-018', toPortId: 'ip-018-1', label: '' },

    // Customer Segmentation → downstream
    { id: 'conn-028', fromProductId: 'dp-015', fromPortId: 'op-015-2', toProductId: 'dp-019', toPortId: 'ip-019-1', label: '' },

    // CEM Analytics → downstream
    { id: 'conn-029', fromProductId: 'dp-016', fromPortId: 'op-016-1', toProductId: 'dp-019', toPortId: 'ip-019-2', label: '' },
    { id: 'conn-030', fromProductId: 'dp-016', fromPortId: 'op-016-3', toProductId: 'dp-020', toPortId: 'ip-020-2', label: '' },
  ];

  // ─────────────────────────────────────────────────────────────
  // Sample orders referencing telco data products
  // ─────────────────────────────────────────────────────────────
  const initialOrders = [
    {
      id: 'ord-001', productId: 'dp-010', outputPortId: 'op-010-1',
      status: 'active',
      requestedAt: '2025-10-03T08:00:00Z', deliveredAt: '2025-10-03T10:45:00Z',
      purpose: 'Real-time personalised offer decisioning engine (NBO/NBA)',
      team: 'Marketing Technology',
    },
    {
      id: 'ord-002', productId: 'dp-008', outputPortId: 'op-008-3',
      status: 'active',
      requestedAt: '2025-11-15T09:30:00Z', deliveredAt: '2025-11-16T08:00:00Z',
      purpose: 'Network capacity planning dashboard and CAPEX justification',
      team: 'Network Planning & Strategy',
    },
    {
      id: 'ord-003', productId: 'dp-015', outputPortId: 'op-015-2',
      status: 'processing',
      requestedAt: '2026-01-20T14:00:00Z', deliveredAt: null,
      purpose: 'B2B upsell ARPU segmentation for enterprise sales team',
      team: 'Revenue Management',
    },
    {
      id: 'ord-004', productId: 'dp-019', outputPortId: 'op-019-1',
      status: 'active',
      requestedAt: '2025-12-01T10:00:00Z', deliveredAt: '2025-12-02T07:00:00Z',
      purpose: 'Proactive churn prevention — automated save-offer trigger',
      team: 'Customer Retention',
    },
    {
      id: 'ord-005', productId: 'dp-017', outputPortId: 'op-017-2',
      status: 'pending',
      requestedAt: '2026-02-10T11:00:00Z', deliveredAt: null,
      purpose: 'Real-time SIM-swap fraud blocking integration with MSC/HLR',
      team: 'Security & Fraud Operations',
    },
    {
      id: 'ord-006', productId: 'dp-011', outputPortId: 'op-011-1',
      status: 'processing',
      requestedAt: '2026-02-28T09:00:00Z', deliveredAt: null,
      purpose: 'Enterprise SLA dashboard for wholesale customers (B2B portal)',
      team: 'Wholesale & Enterprise IT',
    },
  ];

  // ─────────────────────────────────────────────────────────────
  // State
  // ─────────────────────────────────────────────────────────────
  const state = {
    products:    JSON.parse(JSON.stringify(initialProducts)),
    connections: JSON.parse(JSON.stringify(initialConnections)),
    orders:      JSON.parse(JSON.stringify(initialOrders)),
  };

  // ---------- Event bus ----------
  const _listeners = {};
  function on(event, fn)  { (_listeners[event] = _listeners[event] || []).push(fn); }
  function off(event, fn) { _listeners[event] = (_listeners[event] || []).filter(f => f !== fn); }
  function emit(event, data) { (_listeners[event] || []).forEach(fn => fn(data)); }

  // ---------- Products CRUD ----------
  function getProduct(id) { return state.products.find(p => p.id === id); }

  function addProduct(product) {
    const id = 'dp-' + String(Date.now()).slice(-6);
    const newProduct = { ...product, id, x: 300 + Math.random() * 600, y: 300 + Math.random() * 400 };
    state.products.push(newProduct);
    emit('products:change');
    return newProduct;
  }

  function updateProduct(id, changes) {
    const idx = state.products.findIndex(p => p.id === id);
    if (idx === -1) return null;
    state.products[idx] = { ...state.products[idx], ...changes };
    emit('products:change');
    return state.products[idx];
  }

  function deleteProduct(id) {
    state.products    = state.products.filter(p => p.id !== id);
    state.connections = state.connections.filter(c => c.fromProductId !== id && c.toProductId !== id);
    emit('products:change');
    emit('connections:change');
  }

  // ---------- Orders CRUD ----------
  function placeOrder(order) {
    const id = 'ord-' + String(Date.now()).slice(-6);
    const newOrder = { ...order, id, status: 'pending', requestedAt: new Date().toISOString(), deliveredAt: null };
    state.orders.push(newOrder);
    emit('orders:change');
    return newOrder;
  }

  function advanceOrderStatus(id) {
    const order = state.orders.find(o => o.id === id);
    if (!order) return;
    const flow = ['pending', 'processing', 'active'];
    const idx  = flow.indexOf(order.status);
    if (idx !== -1 && idx < flow.length - 1) {
      order.status = flow[idx + 1];
      if (order.status === 'active') order.deliveredAt = new Date().toISOString();
      emit('orders:change');
    }
  }

  function cancelOrder(id) {
    const order = state.orders.find(o => o.id === id);
    if (order && order.status !== 'active') {
      order.status = 'cancelled';
      emit('orders:change');
    }
  }

  // ---------- Helpers ----------
  function getDomainColor(domain) { return DOMAIN_COLORS[domain] || '#64748b'; }
  function getPortTypeColor(type)  { return PORT_TYPE_COLORS[type]  || '#64748b'; }

  function getPortById(productId, portId) {
    const p = getProduct(productId);
    if (!p) return null;
    return [...p.inputPorts, ...p.outputPorts].find(port => port.id === portId) || null;
  }

  function getStats() {
    return {
      totalProducts:      state.products.length,
      activeProducts:     state.products.filter(p => p.status === 'active').length,
      draftProducts:      state.products.filter(p => p.status === 'draft').length,
      deprecatedProducts: state.products.filter(p => p.status === 'deprecated').length,
      totalOrders:        state.orders.length,
      activeOrders:       state.orders.filter(o => o.status === 'active').length,
      pendingOrders:      state.orders.filter(o => o.status === 'pending' || o.status === 'processing').length,
      totalConnections:   state.connections.length,
    };
  }

  return {
    state, on, off, emit,
    getProduct, addProduct, updateProduct, deleteProduct,
    placeOrder, advanceOrderStatus, cancelOrder,
    getDomainColor, getPortTypeColor, getPortById, getStats,
    DOMAIN_COLORS, PORT_TYPE_COLORS,
  };
})();
