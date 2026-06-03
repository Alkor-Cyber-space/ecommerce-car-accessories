import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BsSearch, BsFilter, BsClock, BsCheck2Circle, BsExclamationCircle } from 'react-icons/bs';
import { HiOutlineDotsVertical } from 'react-icons/hi';
import { GoArrowUpRight, GoArrowDownRight } from 'react-icons/go';
import { AiOutlineEye, AiOutlineMessage } from 'react-icons/ai';
import { getSupportTicketsApi } from '../../services/allAPI';

const SupportHelpAdmin = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [activeDropdown, setActiveDropdown] = useState(null);
const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  // Mock data for vendor support tickets
  // const [tickets, setTickets] = useState([
  //   {
  //     id: "TKT-001",
  //     vendorId: "VND-001",
  //     vendorName: "Vendor 1",
  //     subject: "Product Upload Issue",
  //     description: "Unable to upload product images. Getting error 'File size too large' even with small images.",
  //     status: "Pending",
  //     priority: "High",
  //     category: "Technical",
  //     submittedAt: "2024-01-15 10:30 AM",
  //     lastUpdated: "2024-01-15 10:30 AM",
  //     responses: []
  //   },
  //   {
  //     id: "TKT-002",
  //     vendorId: "VND-002", 
  //     vendorName: "Vendor 2",
  //     subject: "Payment Settlement Delay",
  //     description: "My last week's payment settlement is delayed. Usually get payments on Monday but it's Wednesday now.",
  //     status: "In Progress",
  //     priority: "Medium",
  //     category: "Payment",
  //     submittedAt: "2024-01-14 02:15 PM",
  //     lastUpdated: "2024-01-15 09:45 AM",
  //     responses: [
  //       {
  //         from: "admin",
  //         message: "We're looking into this issue. Please provide your bank details.",
  //         timestamp: "2024-01-15 09:45 AM"
  //       }
  //     ]
  //   },
  //   {
  //     id: "TKT-003",
  //     vendorId: "VND-001",
  //     vendorName: "Vendor 1", 
  //     subject: "Account Verification",
  //     description: "My account verification is pending for 5 days. Need help to complete the process.",
  //     status: "Resolved",
  //     priority: "Low",
  //     category: "Account",
  //     submittedAt: "2024-01-10 11:20 AM",
  //     lastUpdated: "2024-01-12 03:30 PM",
  //     responses: [
  //       {
  //         from: "admin",
  //         message: "Your documents have been verified successfully. Account is now active.",
  //         timestamp: "2024-01-12 03:30 PM"
  //       }
  //     ]
  //   },
  //   {
  //     id: "TKT-004",
  //     vendorId: "VND-003",
  //     vendorName: "Vendor 3",
  //     subject: "Order Management Help",
  //     description: "How do I cancel an order that customer requested? Cannot find the cancel option.",
  //     status: "Pending",
  //     priority: "Medium",
  //     category: "General",
  //     submittedAt: "2024-01-15 04:20 PM",
  //     lastUpdated: "2024-01-15 04:20 PM",
  //     responses: []
  //   }
  // ]);

const filteredTickets = tickets.filter(ticket => {
  const idString = ticket.id?.toString().toLowerCase() || '';
  const vendorName = ticket.vendorName?.toLowerCase() || '';
  const subject = ticket.subject?.toLowerCase() || '';
  const search = searchTerm.toLowerCase();

  const matchesSearch =
    searchTerm === '' ||
    vendorName.includes(search) ||
    subject.includes(search) ||
    idString.includes(search);

  const matchesStatus =
    statusFilter === '' || ticket.status === statusFilter;

  const matchesPriority =
    priorityFilter === '' || ticket.priority === priorityFilter;

  const matchesTab =
    activeTab === 'all' ||
    ticket.status?.toLowerCase() === activeTab;

  return matchesSearch && matchesStatus && matchesPriority && matchesTab;
});


  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-600';
      case 'In Progress':
        return 'bg-blue-100 text-blue-600';
      case 'Resolved':
        return 'bg-green-100 text-green-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-600';
      case 'Medium':
        return 'bg-orange-100 text-orange-600';
      case 'Low':
        return 'bg-green-100 text-green-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const handleActionClick = (ticketId) => {
    setActiveDropdown(activeDropdown === ticketId ? null : ticketId);
  };

  const handleStatusUpdate = (ticketId, newStatus) => {
    const updatedTickets = tickets.map(ticket => {
      if (ticket.id === ticketId) {
        return {
          ...ticket,
          status: newStatus,
          lastUpdated: new Date().toLocaleString()
        };
      }
      return ticket;
    });
    setTickets(updatedTickets);
    setActiveDropdown(null);
  };
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const data = await getSupportTicketsApi();
        console.log("Support Tickets:", data);

        // map API response → match UI structure
        const formattedTickets = data.map(ticket => ({
          id: ticket.id,         // API gives "ticket_id"
          vendorId: ticket.vendor || "VND-000",
          vendorName: `Vendor ${ticket.vendor || "-"}`, // adjust if backend sends vendor details
          subject: ticket.subject,
          description: ticket.description,
          status: ticket.status === "pending" ? "Pending" 
                 : ticket.status === "in_progress" ? "In Progress" 
                 : ticket.status === "resolved" ? "Resolved"
                 : ticket.status, 
          priority: ticket.priority ? ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1) : "Low",
          category: ticket.category,
          submittedAt: new Date(ticket.created_at).toLocaleString(),
          lastUpdated: new Date(ticket.updated_at).toLocaleString(),
          responses: ticket.answer ? [{ from: "admin", message: ticket.answer, timestamp: ticket.updated_at }] : []
        }));

        setTickets(formattedTickets);
      } catch (error) {
        console.error("Failed to load support tickets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);
  // Calculate stats
  const totalTickets = tickets.length;
  const pendingTickets = tickets.filter(t => t.status === 'Pending').length;
  const resolvedTickets = tickets.filter(t => t.status === 'Resolved').length;
  const inProgressTickets = tickets.filter(t => t.status === 'In Progress').length;

  // Vendor stats
  const vendorStats = tickets.reduce((acc, ticket) => {
    if (!acc[ticket.vendorId]) {
      acc[ticket.vendorId] = {
        name: ticket.vendorName,
        total: 0,
        pending: 0,
        resolved: 0
      };
    }
    acc[ticket.vendorId].total++;
    if (ticket.status === 'Pending') acc[ticket.vendorId].pending++;
    if (ticket.status === 'Resolved') acc[ticket.vendorId].resolved++;
    return acc;
  }, {});

  useEffect(() => {
    const handleClickOutside = () => {
      setActiveDropdown(null);
    };

    if (activeDropdown) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [activeDropdown]);

  return (
    <div className="bg-[#ECECF0] p-6 rounded-2xl w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-[#5737B4]">Support & Help Management</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Tickets</p>
              <h2 className="text-2xl font-bold">{totalTickets}</h2>
            </div>
            <BsExclamationCircle className="text-blue-500 text-2xl" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <h2 className="text-2xl font-bold text-yellow-600">{pendingTickets}</h2>
            </div>
            <BsClock className="text-yellow-500 text-2xl" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <h2 className="text-2xl font-bold text-blue-600">{inProgressTickets}</h2>
            </div>
            <GoArrowUpRight className="text-blue-500 text-2xl" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Resolved</p>
              <h2 className="text-2xl font-bold text-green-600">{resolvedTickets}</h2>
            </div>
            <BsCheck2Circle className="text-green-500 text-2xl" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <BsSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by vendor, subject, or ticket ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5737B4]"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5737B4]"
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5737B4]"
            >
              <option value="">All Priority</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-4 ">
          {['all', 'pending', 'resolved'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium capitalize rounded-t-lg ${
                activeTab === tab
                  ? 'bg-[#5737B4] text-white'
                  : 'text-gray-600 hover:text-[#5737B4]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6">
        {/* Tickets Table */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl overflow-hidden">
            <div className="overflow-x-auto scrollbar-none">
              <table className="min-w-full text-sm">
                <thead className="">
                  <tr>
                    <th className="py-3 px-4 text-left font-semibold">Ticket ID</th>
                    <th className="py-3 px-4 text-left font-semibold">Vendor</th>
                    <th className="py-3 px-4 text-left font-semibold">Subject</th>
                    <th className="py-3 px-4 text-left font-semibold">Priority</th>
                    <th className="py-3 px-4 text-left font-semibold">Status</th>
                    <th className="py-3 px-4 text-left font-semibold">Date</th>
                    <th className="py-3 px-4 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map((ticket) => (
                    <tr key={ticket.id} className=" hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-[#5737B4]">{ticket.id}</td>
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium">{ticket.vendorName}</div>
                          <div className="text-xs text-gray-500">{ticket.vendorId}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="max-w-xs">
                          <div className="font-medium truncate">{ticket.subject}</div>
                          <div className="text-xs text-gray-500">{ticket.category}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(ticket.status)}`}>
                          {ticket.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-600">{ticket.submittedAt}</td>
                      <td className="py-3 px-4 relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleActionClick(ticket.id);
                          }}
                          className="p-1 hover:bg-gray-100 rounded-full"
                        >
                          <HiOutlineDotsVertical className="text-gray-500" />
                        </button>

                        {activeDropdown === ticket.id && (
                          <div className="absolute right-0 top-8 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                            <Link
                              to={`/admin/support-response`}
                              state={{ ticket }}
                              className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <AiOutlineEye /> View Details
                            </Link>

                            <Link
                              to={`/admin/support-response`}
                              state={{ ticket }}
                              className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <AiOutlineMessage /> Answer
                            </Link>
                            <button
                              onClick={() => handleStatusUpdate(ticket.id, 'Resolved')}
                              className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-gray-50"
                            >
                              Mark Resolved
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportHelpAdmin;