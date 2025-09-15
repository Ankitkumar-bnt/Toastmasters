import React, { useState } from 'react';
import { Card, Button } from 'react-bootstrap';
import { Award } from 'lucide-react';
import GemOfMonthModal from '../admin/GemOfMonthModal';

const MemberGemOfMonth = () => {
  const [show, setShow] = useState(true); // open by default when page is opened

  return (
    <div>
      <div className="mb-4 d-flex align-items-center">
        <Award size={28} className="text-warning me-2" />
        <div>
          <h2 className="mb-0">Gem of the Month</h2>
          <p className="text-muted mb-0">View past month's gems</p>
        </div>
      </div>

      <Card className="shadow-sm">
        <Card.Body className="d-flex justify-content-between align-items-center">
          <div>
            View the members awarded as Gem of the Month.
          </div>
          <Button variant="primary" onClick={() => setShow(true)}>Open</Button>
        </Card.Body>
      </Card>

      <GemOfMonthModal show={show} onHide={() => setShow(false)} />
    </div>
  );
};

export default MemberGemOfMonth;
