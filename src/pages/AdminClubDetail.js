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
      {/* Simple Navigation - No Card */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/admin/clubs')}
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors px-3 py-2 rounded-lg hover:bg-blue-50"
            >
              <ArrowLeft size={20} className="mr-2" />
              <span className="font-medium">Clubs</span>
            </button>
            <div className="text-gray-300">/</div>
            <span className="text-gray-900 font-semibold">{club.name}</span>
          </div>
          <span className={`px-4 py-2 rounded-lg text-sm font-medium ${
            club.isActive 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : 'bg-red-100 text-red-700 border border-red-200'
          }`}>
            {club.isActive ? '● Active' : '● Inactive'}
          </span>
        </div>

        <div className="space-y-8">
        {/* Club Header - No Card Wrapper */}
        <div className="mb-6">
          <div className="flex items-start gap-6 mb-6">
            {/* Club Logo */}
            <div className="flex-shrink-0">
              {club.image ? (
                <div className="w-20 h-20 rounded-xl overflow-hidden shadow-md border border-gray-200">
                  <img
                    src={`http://localhost:5000${club.image}`}
                    alt={club.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-2xl font-bold text-white">
                    {club.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            
            {/* Club Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">{club.name}</h1>
              <div className="flex items-center gap-4 mb-4">
                <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                  {club.category}
                </span>
                <span className="flex items-center text-gray-600 text-sm">
                  <Users size={16} className="mr-2 text-blue-500" />
                  {club.members?.length || 0} Members
                </span>
                <span className="flex items-center text-gray-600 text-sm">
                  <Calendar size={16} className="mr-2 text-green-500" />
                  {formatDate(club.createdAt)}
                </span>
              </div>
              <p className="text-gray-700 text-lg leading-relaxed">{club.description}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={() => setIsCreateEventModalOpen(true)}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center text-sm shadow-md"
            >
              <Plus size={16} className="mr-2" />
              Create Event
            </button>
            <button
              onClick={exportToExcel}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center text-sm shadow-md"
            >
              <Download size={16} className="mr-2" />
              Export Data
            </button>
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm shadow-md"
            >
              <Edit size={16} className="mr-2" />
              Edit Club
            </button>
            <button 
              onClick={() => setShowDeleteModal(true)}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center text-sm shadow-md"
            >
              <Trash2 size={16} className="mr-2" />
              Delete Club
            </button>
          </div>

          {/* Requirements */}
          {club.requirements && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Shield size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-amber-900 text-sm mb-1">Membership Requirements</h3>
                  <p className="text-amber-800 text-sm">{club.requirements}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Members Section - No Card Wrapper */}
        <div>
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Club Members</h2>
                <p className="text-gray-600">Manage membership and assign roles</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm w-72 bg-white shadow-sm"
                  />
                </div>
                <div className="bg-gray-100 px-4 py-3 rounded-lg border border-gray-300">
                  <span className="text-sm font-medium text-gray-700">
                    {filteredMembers.length} of {club.members?.length || 0} members
                  </span>
                </div>
              </div>
            </div>
            <div className="border-b border-gray-200"></div>
          </div>

          {/* Members List */}
          {filteredMembers.length === 0 ? (
            <div className="text-center py-16">
              <Users size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No members found</h3>
              <p className="text-gray-500 text-sm max-w-md mx-auto">
                {searchTerm ? 'No members match your search criteria. Try adjusting your search terms.' : 'This club doesn\'t have any members yet. Invite members to get started.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMembers.map((member, index) => (
                <div key={index} className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-all duration-200 shadow-sm">
                  {/* Member Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                        <span className="text-white font-semibold text-sm">
                          {member.user.firstName.charAt(0)}{member.user.lastName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                          {member.user.firstName} {member.user.lastName}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(member.role)}`}>
                          {getRoleIcon(member.role)}
                          <span className="ml-1">{getRoleDisplayName(member.role)}</span>
                        </span>
                      </div>
                    </div>
                    
                    {/* Action Menu */}
                    <div className="relative">
                      <button
                        onClick={() => setActionMenuOpen(actionMenuOpen === index ? null : index)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                      >
                        <MoreVertical size={16} />
                      </button>
                      
                      {actionMenuOpen === index && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-20 py-1">
                          <button
                            onClick={() => handleViewProfile(member.user._id)}
                            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 flex items-center"
                          >
                            <User size={14} className="mr-3 text-blue-600" />
                            View Profile
                          </button>
                          <div className="border-t border-gray-100 my-1"></div>
                          <button
                            onClick={() => handleChangeMemberRole(member.user._id, 'club_head')}
                            disabled={member.role === 'club_head'}
                            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-yellow-50 disabled:opacity-50 flex items-center"
                          >
                            <Crown size={14} className="mr-3 text-yellow-600" />
                            Make Club Head
                          </button>
                          <button
                            onClick={() => handleChangeMemberRole(member.user._id, 'moderator')}
                            disabled={member.role === 'moderator'}
                            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 disabled:opacity-50 flex items-center"
                          >
                            <Shield size={14} className="mr-3 text-blue-600" />
                            Make Moderator
                          </button>
                          <button
                            onClick={() => handleChangeMemberRole(member.user._id, 'member')}
                            disabled={member.role === 'member'}
                            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 flex items-center"
                          >
                            <User size={14} className="mr-3 text-gray-600" />
                            Make Member
                          </button>
                          <div className="border-t border-gray-100 my-1"></div>
                          <button
                            onClick={() => handleRemoveMember(member.user._id)}
                            className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                          >
                            <UserX size={14} className="mr-3" />
                            Remove Member
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Member Details */}
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail size={14} className="mr-2 text-blue-500 flex-shrink-0" />
                      <span className="truncate">{member.user.email}</span>
                    </div>
                    
                    {member.user.rollNo && (
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="w-3.5 h-3.5 bg-green-500 rounded-full mr-2 flex-shrink-0"></span>
                        <span>Roll: {member.user.rollNo}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="w-3.5 h-3.5 bg-purple-500 rounded-full mr-2 flex-shrink-0"></span>
                      <span className="truncate">{member.user.college} - {member.user.department}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar size={14} className="mr-2 text-orange-500 flex-shrink-0" />
                      <span>Joined {new Date(member.joinedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
    </div>
  );
};

export default AdminClubDetail;
