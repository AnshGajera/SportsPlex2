import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Users, Mail, Calendar, Download, Search, Ellipsis, 
  UserX, Crown, Shield, User, Edit, Trash2, MoreVertical, Plus 
} from 'lucide-react';
import api from '../services/api';
import * as XLSX from 'xlsx';
import CreateEventModal from '../components/Modals/CreateEventModal';
import EditClubModal from '../components/Modals/EditClubModal';

const AdminClubDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchClubDetails();
  }, [id]);

  const fetchClubDetails = async () => {
    try {
      const response = await api.get(`/clubs/${id}`);
      setClub(response.data);
    } catch (error) {
      console.error('Error fetching club details:', error);
      setError('Failed to load club details');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;

    try {
      await api.delete(`/clubs/${id}/members/${memberId}`);
      setClub(prev => ({
        ...prev,
        members: prev.members.filter(member => member.user._id !== memberId)
      }));
      alert('Member removed successfully');
    } catch (error) {
      console.error('Error removing member:', error);
      alert(error.response?.data?.message || 'Failed to remove member');
    }
  };

  const handleViewProfile = (userId) => {
    navigate(`/admin/user-profile/${userId}`);
    setActionMenuOpen(null);
  };

  const handleChangeMemberRole = async (memberId, newRole) => {
    try {
      const response = await api.put(`/clubs/${id}/members/${memberId}/role`, {
        role: newRole
      });
      
      setClub(prev => ({
        ...prev,
        members: prev.members.map(member => 
          member.user._id === memberId 
            ? { ...member, role: newRole }
            : member
        )
      }));
      alert('Member role updated successfully');
    } catch (error) {
      console.error('Error updating member role:', error);
      alert(error.response?.data?.message || 'Failed to update member role');
    }
    setActionMenuOpen(null);
  };

  const exportToExcel = () => {
    if (!club || !club.members || club.members.length === 0) {
      alert('No members to export');
      return;
    }

    // Debug: Log member data to see phone numbers
    console.log('=== EXCEL EXPORT DEBUG ===');
    club.members.forEach((member, index) => {
      console.log(`Member ${index + 1}:`, {
        name: `${member.user.firstName} ${member.user.lastName}`,
        email: member.user.email,
        phoneNumber: member.user.phoneNumber,
        phoneType: typeof member.user.phoneNumber,
        rawUser: member.user
      });
    });

    // Prepare data for Excel
    const exportData = club.members.map((member, index) => ({
      'Serial No.': index + 1,
      'First Name': member.user.firstName,
      'Last Name': member.user.lastName,
      'Email': member.user.email,
      'Phone Number': member.user.phoneNumber || 'N/A',
      'Roll Number': member.user.rollNo || 'N/A',
      'College': member.user.college || 'N/A',
      'Department': member.user.department || 'N/A',
      'Club Role': member.role,
      'Club Joined Date': new Date(member.joinedAt).toLocaleDateString('en-US'),
      'Certificates Count': member.user.certificates ? member.user.certificates.length : 0
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Set column widths
    const columnWidths = [
      { wch: 8 },  // Serial No.
      { wch: 15 }, // First Name
      { wch: 15 }, // Last Name
      { wch: 25 }, // Email
      { wch: 15 }, // Phone Number
      { wch: 15 }, // Roll Number
      { wch: 20 }, // College
      { wch: 20 }, // Department
      { wch: 12 }, // Club Role
      { wch: 15 }, // Club Joined Date
      { wch: 12 }  // Certificates Count
    ];
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Members');

    // Add club info sheet
    const clubInfoData = [
      { Property: 'Club Name', Value: club.name },
      { Property: 'Category', Value: club.category },
      { Property: 'Description', Value: club.description },
      { Property: 'Contact Email', Value: club.contactEmail || 'N/A' },
      { Property: 'Max Members', Value: club.maxMembers || 'Unlimited' },
      { Property: 'Current Members', Value: club.members.length },
      { Property: 'Status', Value: club.isActive ? 'Active' : 'Inactive' },
      { Property: 'Created Date', Value: new Date(club.createdAt).toLocaleDateString('en-US') },
      { Property: 'Requirements', Value: club.requirements || 'None' }
    ];

    const clubInfoSheet = XLSX.utils.json_to_sheet(clubInfoData);
    clubInfoSheet['!cols'] = [{ wch: 20 }, { wch: 50 }];
    XLSX.utils.book_append_sheet(workbook, clubInfoSheet, 'Club Info');

    // Generate filename with club name and current date
    const fileName = `${club.name.replace(/[^a-zA-Z0-9]/g, '_')}_Members_${new Date().toISOString().split('T')[0]}.xlsx`;

    // Download file
    XLSX.writeFile(workbook, fileName);
  };

  const filteredMembers = club?.members?.filter(member =>
    member.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.user.rollNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.user.college?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.user.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.user.role.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'club_head': return <Crown size={16} className="text-yellow-600" />;
      case 'moderator': return <Shield size={16} className="text-blue-600" />;
      default: return <User size={16} className="text-gray-600" />;
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'club_head': return 'bg-yellow-100 text-yellow-800';
      case 'moderator': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'club_head': return 'Club Head';
      case 'moderator': return 'Moderator';
      default: return 'Member';
    }
  };

  const handleEventCreated = (newEvent) => {
    // Event created successfully, close modal
    setIsCreateEventModalOpen(false);
    // Could add notification here
  };

  const handleDeleteClub = async () => {
    try {
      await api.delete(`/clubs/${id}`);
      alert('Club deleted successfully');
      navigate('/admin/clubs');
    } catch (error) {
      console.error('Error deleting club:', error);
      alert(error.response?.data?.message || 'Failed to delete club');
    }
    setShowDeleteModal(false);
  };

  const handleClubUpdated = (updatedClub) => {
    setClub(updatedClub);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading club details...</p>
        </div>
      </div>
    );
  }

  if (error || !club) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Club Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The club you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/admin/clubs')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Clubs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/admin/clubs')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Clubs
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Club Header */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="relative">
            {/* Club Image */}
            <div className="h-48 bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
              {club.image ? (
                <img
                  src={`http://localhost:5000${club.image}`}
                  alt={club.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center text-white">
                  <Users size={48} className="mx-auto mb-2" />
                  <h1 className="text-3xl font-bold">{club.name}</h1>
                </div>
              )}
            </div>
          </div>

          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{club.name}</h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                    {club.category}
                  </span>
                  <span className="flex items-center">
                    <Users size={16} className="mr-1" />
                    {club.members?.length || 0} members
                  </span>
                  <span className="flex items-center">
                    <Calendar size={16} className="mr-1" />
                    Created {formatDate(club.createdAt)}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    club.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {club.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setIsCreateEventModalOpen(true)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                >
                  <Plus size={16} className="mr-2" />
                  Create Event
                </button>
                <button
                  onClick={exportToExcel}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <Download size={16} className="mr-2" />
                  Export Excel
                </button>
                <button 
                  onClick={() => setIsEditModalOpen(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Edit size={16} className="mr-2" />
                  Edit Club
                </button>
                <button 
                  onClick={() => setShowDeleteModal(true)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete Club
                </button>
              </div>
            </div>

            <p className="text-gray-700 mb-4">{club.description}</p>

            {club.requirements && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Membership Requirements:</h3>
                <p className="text-gray-700">{club.requirements}</p>
              </div>
            )}
          </div>
        </div>

        {/* Members Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Club Members</h2>
                <p className="text-gray-600">Manage club membership and roles</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <span className="text-sm text-gray-500">
                  {filteredMembers.length} of {club.members?.length || 0} members
                </span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Member Profile
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact Information
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Roles & Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Membership Timeline
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMembers.map((member, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {member.user.firstName.charAt(0)}{member.user.lastName.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {member.user.firstName} {member.user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            Roll No: {member.user.rollNo || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {member.user.college} - {member.user.department}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{member.user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(member.role)}`}>
                        {getRoleIcon(member.role)}
                        <span className="ml-1">{getRoleDisplayName(member.role)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(member.joinedAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="relative">
                        <button
                          onClick={() => setActionMenuOpen(actionMenuOpen === index ? null : index)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <MoreVertical size={16} />
                        </button>
                        
                        {actionMenuOpen === index && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                            <div className="py-1">
                              <button
                                onClick={() => handleViewProfile(member.user._id)}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <User size={14} className="inline mr-2" />
                                View Profile
                              </button>
                              <hr className="my-1" />
                              <button
                                onClick={() => handleChangeMemberRole(member.user._id, 'club_head')}
                                disabled={member.role === 'club_head'}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                              >
                                Make Club Head
                              </button>
                              <button
                                onClick={() => handleChangeMemberRole(member.user._id, 'moderator')}
                                disabled={member.role === 'moderator'}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                              >
                                Make Moderator
                              </button>
                              <button
                                onClick={() => handleChangeMemberRole(member.user._id, 'member')}
                                disabled={member.role === 'member'}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                              >
                                Make Member
                              </button>
                              <hr className="my-1" />
                              <button
                                onClick={() => handleRemoveMember(member.user._id)}
                                className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                              >
                                <UserX size={14} className="inline mr-2" />
                                Remove Member
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredMembers.length === 0 && (
              <div className="text-center py-12">
                <Users size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No members found</h3>
                <p className="text-gray-500">
                  {searchTerm ? 'No members match your search criteria.' : 'This club has no members yet.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={isCreateEventModalOpen}
        onClose={() => setIsCreateEventModalOpen(false)}
        onEventCreated={handleEventCreated}
        clubId={id}
        isAdminMode={true}
      />

      {/* Edit Club Modal */}
      <EditClubModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        club={club}
        onClubUpdated={handleClubUpdated}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <Trash2 size={24} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Club</h3>
                <p className="text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700">
                Are you sure you want to delete <strong>{club?.name}</strong>? 
                This will permanently remove the club and all its data including:
              </p>
              <ul className="mt-3 text-sm text-gray-600 list-disc list-inside space-y-1">
                <li>All club members ({club?.members?.length || 0} members)</li>
                <li>Club settings and configuration</li>
                <li>Associated events and activities</li>
                <li>Club image and files</li>
              </ul>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteClub}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Club
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminClubDetail;
