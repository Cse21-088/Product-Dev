import { useState, useEffect } from 'react';
import { firestore } from '../../database/firebase';
import { collection, query, where, getDocs, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { Users, Plus, X, Tag, Edit2, Trash2, Search } from 'lucide-react';

const CustomerGroups = () => {
  const [customers, setCustomers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [editingGroup, setEditingGroup] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showGroupMembers, setShowGroupMembers] = useState(false);

  useEffect(() => {
    fetchCustomers();
    fetchGroups();
  }, []);

  const fetchCustomers = async () => {
    try {
      const q = query(collection(firestore, 'contactSubmissions'));
      const snapshot = await getDocs(q);
      const customersList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCustomers(customersList);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchGroups = async () => {
    try {
      const q = query(collection(firestore, 'customerGroups'));
      const snapshot = await getDocs(q);
      const groupsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setGroups(groupsList);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const createGroup = async () => {
    if (!newGroupName.trim()) return;

    try {
      const newGroup = {
        name: newGroupName,
        customers: [],
        createdAt: new Date()
      };

      await addDoc(collection(firestore, 'customerGroups'), newGroup);
      setNewGroupName('');
      fetchGroups();
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  const updateGroup = async (groupId, newName) => {
    if (!newName.trim()) return;

    try {
      const groupRef = doc(firestore, 'customerGroups', groupId);
      await updateDoc(groupRef, {
        name: newName,
        updatedAt: new Date()
      });
      setEditingGroup(null);
      fetchGroups();
    } catch (error) {
      console.error('Error updating group:', error);
    }
  };

  const deleteGroup = async (groupId) => {
    try {
      await deleteDoc(doc(firestore, 'customerGroups', groupId));
      fetchGroups();
    } catch (error) {
      console.error('Error deleting group:', error);
    }
  };

  const addCustomerToGroup = async (customerId, groupId) => {
    try {
      const groupRef = doc(firestore, 'customerGroups', groupId);
      const group = groups.find(g => g.id === groupId);
      
      if (!group.customers.includes(customerId)) {
        await updateDoc(groupRef, {
          customers: [...group.customers, customerId],
          updatedAt: new Date()
        });
        fetchGroups();
      }
    } catch (error) {
      console.error('Error adding customer to group:', error);
    }
  };

  const removeCustomerFromGroup = async (customerId, groupId) => {
    try {
      const groupRef = doc(firestore, 'customerGroups', groupId);
      const group = groups.find(g => g.id === groupId);
      
      await updateDoc(groupRef, {
        customers: group.customers.filter(id => id !== customerId),
        updatedAt: new Date()
      });
      fetchGroups();
    } catch (error) {
      console.error('Error removing customer from group:', error);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getGroupMembers = (groupId) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return [];
    return customers.filter(customer => group.customers.includes(customer.id));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create New Group */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-indigo-500/20 p-6">
        <h2 className="text-xl font-semibold mb-4">Create New Group</h2>
        <div className="flex gap-4">
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="Enter group name..."
            className="flex-1 bg-gray-800 border border-indigo-500/20 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors"
          />
          <button
            onClick={createGroup}
            className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg px-4 py-2 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Create Group
          </button>
        </div>
      </div>

      {/* Groups and Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Groups List */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-indigo-500/20 p-6">
          <h2 className="text-xl font-semibold mb-4">Customer Groups</h2>
          <div className="space-y-4">
            {groups.map((group) => (
              <div
                key={group.id}
                className={`p-4 rounded-lg border ${
                  selectedGroup?.id === group.id
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-indigo-500/20 hover:border-indigo-500/40'
                } transition-all`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Users className="text-indigo-400" size={20} />
                    {editingGroup === group.id ? (
                      <input
                        type="text"
                        defaultValue={group.name}
                        onBlur={(e) => updateGroup(group.id, e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && updateGroup(group.id, e.target.value)}
                        className="bg-gray-800 border border-indigo-500/20 rounded px-2 py-1 text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                        autoFocus
                      />
                    ) : (
                      <span className="font-medium">{group.name}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">
                      {group.customers.length} customers
                    </span>
                    <button
                      onClick={() => setEditingGroup(group.id)}
                      className="p-1 hover:bg-indigo-500/20 rounded transition-colors"
                    >
                      <Edit2 size={16} className="text-indigo-400" />
                    </button>
                    <button
                      onClick={() => deleteGroup(group.id)}
                      className="p-1 hover:bg-red-500/20 rounded transition-colors"
                    >
                      <Trash2 size={16} className="text-red-400" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedGroup(group);
                        setShowGroupMembers(true);
                      }}
                      className="p-1 hover:bg-indigo-500/20 rounded transition-colors"
                    >
                      <Users size={16} className="text-indigo-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customers List */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-indigo-500/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Customers</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search customers..."
                className="bg-gray-800 border border-indigo-500/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors"
              />
            </div>
          </div>
          <div className="space-y-4">
            {filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                className="p-4 rounded-lg border border-indigo-500/20 hover:border-indigo-500/40 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium">{customer.name}</p>
                    <p className="text-sm text-gray-400">{customer.company}</p>
                  </div>
                  {selectedGroup && (
                    <button
                      onClick={() => {
                        if (selectedGroup.customers.includes(customer.id)) {
                          removeCustomerFromGroup(customer.id, selectedGroup.id);
                        } else {
                          addCustomerToGroup(customer.id, selectedGroup.id);
                        }
                      }}
                      className={`p-2 rounded-lg ${
                        selectedGroup.customers.includes(customer.id)
                          ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                          : 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30'
                      } transition-colors`}
                    >
                      {selectedGroup.customers.includes(customer.id) ? (
                        <X size={20} />
                      ) : (
                        <Plus size={20} />
                      )}
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {customer.jobDetails.split(' ').slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 bg-indigo-500/10 text-indigo-400 text-xs px-2 py-1 rounded-full"
                    >
                      <Tag size={12} />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Group Members Modal */}
      {showGroupMembers && selectedGroup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-gray-900 rounded-xl border border-indigo-500/20 p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Group Members - {selectedGroup.name}</h2>
              <button
                onClick={() => setShowGroupMembers(false)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {getGroupMembers(selectedGroup.id).map((member) => (
                <div
                  key={member.id}
                  className="p-4 rounded-lg border border-indigo-500/20 hover:border-indigo-500/40 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-gray-400">{member.company}</p>
                    </div>
                    <button
                      onClick={() => removeCustomerFromGroup(member.id, selectedGroup.id)}
                      className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerGroups; 