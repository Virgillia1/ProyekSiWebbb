import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '../components/ui/input';
import { StaffCard } from '../components/StaffCard';
import { StaffDetailModal } from '../components/StaffDetailModal';
import { staff, Staff } from '../data/mockData';
import { motion } from 'motion/react';

export function StaffPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const filteredStaff = staff.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStaffClick = (staffMember: Staff) => {
    setSelectedStaff(staffMember);
    setModalOpen(true);
  };

  return (
    <div>
      {/* Header */}
      <section className="bg-primary text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl font-bold mb-4">Find Our Staff</h1>
            <p className="text-xl text-green-100 max-w-2xl">
              Meet our professional team of couriers and staff members
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-8 bg-background border-b">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="max-w-2xl mx-auto"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by name, role, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-lg"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Staff Grid */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          {filteredStaff.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">No staff members found</p>
              <p className="text-sm text-muted-foreground mt-2">
                Try adjusting your search query
              </p>
            </div>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="mb-6"
              >
                <p className="text-muted-foreground">
                  Showing {filteredStaff.length} staff member{filteredStaff.length !== 1 ? 's' : ''}
                </p>
              </motion.div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStaff.map((staffMember, index) => (
                  <motion.div
                    key={staffMember.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.4 }}
                  >
                    <StaffCard
                      staff={staffMember}
                      onClick={() => handleStaffClick(staffMember)}
                    />
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Staff Detail Modal */}
      <StaffDetailModal
        staff={selectedStaff}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
