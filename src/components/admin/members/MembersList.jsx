import React, { useState } from 'react';
import { Table, Button, Card, Form, InputGroup, Badge, Spinner } from 'react-bootstrap';
import { Search, Edit2, Trash2, Eye, UserPlus } from 'lucide-react';

const MembersList = ({
  users,
  loading,
  onEdit,
  onDelete,
  onAdd,
  onViewGuests
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const visibleUsers = users.filter(user => Number(user.deleteStatus) === 1 && user.userType !== 'guest');
  const filteredUsers = visibleUsers.filter(user =>
    user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.userContact.includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const getGenderBadge = (gender) => {
    const variant = gender === 'Male' ? 'primary' : gender === 'Female' ? 'success' : 'info';
    return <Badge bg={variant}>{gender}</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <Card.Body className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <div className="mt-3">Loading members...</div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-white">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Members Management</h5>
          <div className="d-flex gap-2">
            <Button variant="outline-primary" onClick={onViewGuests}>
              View Guests
            </Button>
            <Button variant="primary" onClick={onAdd}>
              <UserPlus size={18} className="me-2" />
              Add New Member
            </Button>
          </div>
        </div>
      </Card.Header>
      <Card.Body>
        <div className="mb-4">
          <InputGroup>
            <InputGroup.Text>
              <Search size={18} />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search by name, email, or contact..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </InputGroup>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="text-center py-5">
            <Eye size={48} className="text-muted mb-3" />
            <h6 className="text-muted">No members found</h6>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <Table striped hover>
                <thead className="bg-light">
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Contact</th>
                    <th>Gender</th>
                    <th>Date of Birth</th>
                    <th>Mentor</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.map((user, index) => (
                    <tr key={user.userId}>
                      <td>{startIndex + index + 1}</td>
                      <td>
                        <div>
                          <strong>{user.userName}</strong>
                          {user.hobbies && (
                            <div className="text-muted small">
                              Hobbies: {user.hobbies}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>{user.userEmail}</td>
                      <td>{user.userContact}</td>
                      <td>{getGenderBadge(user.gender)}</td>
                      <td>{new Date(user.dob).toLocaleDateString()}</td>
                      <td>
                        {(() => {
                          const id = user.mentor?.userId || user.mentorId;
                          const name = user.mentor?.userName || users.find((u) => Number(u.userId) === Number(id))?.userName;
                          if (name) return <span>{name}</span>;
                          if (id) return <Badge bg="outline-primary text-dark">#{id}</Badge>;
                          return <span className="text-muted">-</span>;
                        })()}
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => onEdit(user, user.userId)}
                            title="Edit Member"
                          >
                            <Edit2 size={14} />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => onDelete(user.userId)}
                            title="Delete Member"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="d-flex justify-content-between align-items-center mt-4">
                <div className="text-muted">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredUsers.length)} of {filteredUsers.length} entries
                </div>
                <div className="d-flex gap-2">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Previous
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'primary' : 'outline-primary'}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="outline-primary"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default MembersList; 