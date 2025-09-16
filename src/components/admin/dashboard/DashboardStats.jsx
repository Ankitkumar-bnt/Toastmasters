import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { Users, UserPlus, Calendar, Award } from 'lucide-react';

const DashboardStats = ({ totalMembers, totalMeetings, onMeetingsClick, onBackoutsClick }) => {
    
  const stats = [
    {
      title: 'Total Members',
      value: totalMembers,
      icon: Users,
      color: 'primary',
      bgColor: 'rgba(13, 110, 253, 0.1)'
    },
    {
      title: 'New This Month',
      value: Math.floor(totalMembers * 0.2),
      icon: UserPlus,
      color: 'success',
      bgColor: 'rgba(25, 135, 84, 0.1)'
    },
    {
      title: 'Total Meetings',
      value: totalMeetings || 0,
      icon: Calendar,
      color: 'info',
      bgColor: 'rgba(13, 202, 240, 0.1)',
      clickable: true,
      onClick: onMeetingsClick
    },
    {
      title: 'Track Backouts',
      value: '',
      icon: Award,
      color: 'warning',
      bgColor: 'rgba(255, 193, 7, 0.1)',
      clickable: true,
      onClick: onBackoutsClick
    }
  ];

  return (
    <Row className="g-4 mb-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Col key={index} md={6} lg={3}>
            <Card 
              className={`border-0 shadow-sm h-100 ${stat.clickable ? 'hover-card' : ''}`}
              style={{ cursor: stat.clickable ? 'pointer' : 'default' }}
              onClick={stat.onClick}
            >
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div
                    className={`p-3 rounded-circle me-3`}
                    style={{ backgroundColor: stat.bgColor, color: `var(--bs-${stat.color})` }}
                  >
                    <Icon size={24} />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1">{stat.title}</h6>
                    <h3 className="mb-0">{stat.value}</h3>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        );
      })}
    </Row>
  );
};

export default DashboardStats; 