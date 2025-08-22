import React, { useMemo, useState, useEffect } from 'react';
import { Card, Button, Row, Col, Badge, OverlayTrigger, Popover, Spinner } from 'react-bootstrap';
import { Calendar, Clock, MapPin, ChevronLeft } from 'lucide-react';
import { getAllMemberAvailability } from '../../api/AvailableMembersApi';

const MeetingDetails = ({ meeting, users, onBack }) => {
	const [availabilityByStatus, setAvailabilityByStatus] = useState({ '-1': [], '0': [], '1': [], '2': [] });
	const [availabilityLoading, setAvailabilityLoading] = useState(false);

	const meetingDateObj = useMemo(() => (meeting?.meetingDate ? new Date(meeting.meetingDate) : null), [meeting]);

	// Formatters
	const formatDate = (dateString) => {
		if (!dateString) return 'N/A';
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
	};

	const formatTime = (timeString) => {
		if (!timeString) return 'N/A';
		const raw = timeString.includes('T') ? timeString.split('T')[1] : timeString;
		const [hh, mm] = raw.split(':');
		return hh && mm ? `${hh}:${mm}` : raw;
	};

	const getStatusBadge = () => {
		if (!meeting?.meetingDate || !meeting?.startTime || !meeting?.endTime) return <Badge bg="secondary">Unknown</Badge>;
		const [y, m, d] = meeting.meetingDate.split('-').map(Number);
		const [sh, sm] = String(meeting.startTime).split(':');
		const [eh, em] = String(meeting.endTime).split(':');
		const start = new Date(y, (m || 1) - 1, d, Number(sh), Number(sm || 0));
		const end = new Date(y, (m || 1) - 1, d, Number(eh), Number(em || 0));
		const now = new Date();
		if (now < start) return <Badge bg="primary">Upcoming</Badge>;
		if (now >= start && now <= end) return <Badge bg="success">Ongoing</Badge>;
		return <Badge bg="secondary">Past</Badge>;
	};

	const getCategoryBadge = (category) => {
		if (!category || category === 'Regular') return null;
		
		const badgeConfig = {
			'Special': { bg: 'danger', text: 'Special' },
			'Contest': { bg: 'warning', text: 'Contest' }
		};
		
		const config = badgeConfig[category];
		if (!config) return null;
		
		return (
			<Badge bg={config.bg} className="ms-2">
				{config.text}
			</Badge>
		);
	};

	// --- Helpers with Debugging ---
	const extractMeetingId = (item) => {
		const id = item?.meetingId ?? item?.meeting?.meetingId ?? item?.meeting?.id ?? item?.meeting?.meetingID ?? item?.meetingID;
		console.log("Extracted meetingId:", id, "from item:", item);
		return id;
	};

	const extractStatus = (item) => {
		const val = item?.status ?? item?.availability ?? item?.availableStatus ?? item?.available ?? -1;
		const normalized = [-1, 0, 1, 2].includes(Number(val)) ? Number(val) : -1;
		console.log("Extracted status:", val, "=> normalized:", normalized, "from item:", item);
		return normalized;
	};

	const extractUserId = (item) =>
		item?.userId ?? item?.memberId ?? item?.user?.userId ?? item?.user?.id ?? item?.user?.memberId;

	const extractUserName = (item) =>
		item?.userName ?? item?.name ?? item?.user?.userName ?? item?.user?.name;

	const unwrapList = (payload) => {
		if (Array.isArray(payload)) return payload;
		if (payload && typeof payload === 'object') {
			const keys = [
				'content',
				'availableMembers',
				'availableMemberResponses',
				'availableMemberResponseList',
				'list',
				'items',
				'records',
				'data',
			];
			for (const k of keys) {
				const v = payload[k];
				if (Array.isArray(v)) return v;
			}
		}
		return [];
	};

	// --- Effect to fetch availability ---
	useEffect(() => {
		let isMounted = true;
		const fetchAvailability = async () => {
			try {
				setAvailabilityLoading(true);
				const res = await getAllMemberAvailability();
				console.log("API raw response:", res?.data);

				const base = res?.data !== undefined ? res.data : [];
				const payload = base && base.data !== undefined ? base.data : base;
				const all = unwrapList(payload);

				console.log("Unwrapped list:", all);
				console.log("MeetingId from props:", meeting?.meetingId);

				// filter only records for current meeting
				const forMeeting = all.filter(
					(item) => String(extractMeetingId(item)) === String(meeting.meetingId)
				);

				console.log("Filtered for meeting:", forMeeting);

				// group by status
				const grouped = { '-1': [], '0': [], '1': [], '2': [] };
				forMeeting.forEach((item) => {
					const key = String(extractStatus(item));
					if (grouped[key] !== undefined) {
						grouped[key].push(item);
					}
				});

				console.log("Grouped availability:", grouped);

				if (isMounted) setAvailabilityByStatus(grouped);
			} catch (err) {
				console.error('Failed to load availability', err);
			} finally {
				if (isMounted) setAvailabilityLoading(false);
			}
		};
		if (meeting?.meetingId) fetchAvailability();
		return () => {
			isMounted = false;
		};
	}, [meeting?.meetingId]);

	// --- Render helpers ---
	const getMemberLabel = (item) => {
		const memberId = extractUserId(item);
		const fromUsers = users?.find((u) => String(u.userId) === String(memberId));
		const name = extractUserName(item) ?? fromUsers?.userName;
		return `${memberId ?? 'N/A'} ${name ?? 'Unknown'}`;
	};

	const renderStatusBlock = (title, variant, key) => {
		const list = availabilityByStatus[key] || [];
		const rows = list.map((m) => {
			const label = getMemberLabel(m);
			const [idPart, ...nameParts] = label.split(' ');
			return { id: idPart, name: nameParts.join(' ').trim() };
		});

		const popover = (
			<Popover id={`popover-${key}`}>
				<Popover.Header as="h3">{title}</Popover.Header>
				<Popover.Body>
					{availabilityLoading ? (
						<div className="text-center">
							<Spinner animation="border" size="sm" />
						</div>
					) : list.length === 0 ? (
						<div className="text-muted">No members</div>
					) : (
						<div className="small">
							<div className="d-flex fw-bold mb-1" style={{ gap: '1rem' }}>
								<div style={{ width: 60 }}>Id</div>
								<div>Name</div>
							</div>
							{rows.map((r, i) => (
								<div key={i} className="d-flex" style={{ gap: '1rem' }}>
									<div style={{ width: 60 }}>{r.id}</div>
									<div>{r.name}</div>
								</div>
							))}
						</div>
					)}
				</Popover.Body>
			</Popover>
		);

		return (
			<OverlayTrigger trigger={["hover", "focus"]} placement="top" overlay={popover} rootClose={false}>
				<div className="p-3 border rounded text-center" style={{ cursor: 'default' }}>
					<div className="mb-1 text-muted small">{title}</div>
					<Badge bg={variant} pill>
						{availabilityLoading ? '...' : list.length}
					</Badge>
				</div>
			</OverlayTrigger>
		);
	};

	// --- Component Render ---
	return (
		<div>
			<Button variant="link" className="mb-3" onClick={onBack}>
				<ChevronLeft size={18} className="me-1" /> Back to Meetings
			</Button>

			<Card className="shadow-sm mb-4">
				<Card.Body>
					<Row className="align-items-center">
						<Col md={8}>
							<h3 className="mb-1">Meeting Details</h3>
							<div className="text-muted">
								{getStatusBadge()}
								{getCategoryBadge(meeting.category)}
							</div>
						</Col>
						<Col md={4} className="text-md-end mt-3 mt-md-0">
							<div className="d-flex align-items-center justify-content-md-end mb-2">
								<Calendar size={18} className="me-2 text-primary" />
								<strong>{formatDate(meeting.meetingDate)}</strong>
							</div>
							<div className="d-flex align-items-center justify-content-md-end mb-2">
								<Clock size={18} className="me-2 text-primary" />
								{formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
							</div>
							<div className="d-flex align-items-center justify-content-md-end">
								<MapPin size={18} className="me-2 text-primary" />
								{meeting.meetingLocation}
							</div>
						</Col>
					</Row>
					<hr />
					<Row>
						<Col md={6}>
							<div className="mb-3">
								<h5 className="mb-2">Meeting Type</h5>
								<p className="mb-0">{meeting.category || 'Regular'}</p>
							</div>
						</Col>
						<Col md={6}>
							<div className="mb-3">
								<h5 className="mb-2">Theme</h5>
								<p className="mb-0">{meeting.meetingTheme}</p>
							</div>
						</Col>
					</Row>
				</Card.Body>
			</Card>

			<Card className="shadow-sm">
				<Card.Header className="bg-white">
					<h5 className="mb-0">Member Availability</h5>
				</Card.Header>
				<Card.Body>
					<Row className="g-3">
						<Col md={3} sm={6} xs={12}>
							{renderStatusBlock('Available', 'success', '1')}
						</Col>
						<Col md={3} sm={6} xs={12}>
							{renderStatusBlock('Not Available', 'danger', '0')}
						</Col>
						<Col md={3} sm={6} xs={12}>
							{renderStatusBlock('Tentative', 'warning', '2')}
						</Col>
						<Col md={3} sm={6} xs={12}>
							{renderStatusBlock('Not Seen', 'secondary', '-1')}
						</Col>
					</Row>
				</Card.Body>
			</Card>
		</div>
	);
};

export default MeetingDetails;
