import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit3,
  Trash2,
  Filter,
  Search,
} from "lucide-react";
import { useOperationDepartmentLeaves } from "../../hooks/useOperationData";
import { useNotification } from "../../contexts/NotificationContext";
import SimplePagination from "../common/SimplePagination";

const OperationLeavesManagement = () => {
  const { showSuccess, showError } = useNotification();
  const [leavesCurrentPage, setLeavesCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const {
    leaves,
    loading: leavesLoading,
    error: leavesError,
    departmentContext,
    updateLeaveStatus,
    deleteLeave,
  } = useOperationDepartmentLeaves(1, 1000);

  // Defensive cache to avoid transient backend shrink resetting pagination
  const [cachedLeaves, setCachedLeaves] = useState([]);
  useEffect(() => {
    if (Array.isArray(leaves) && leaves.length > 0) {
      setCachedLeaves((prev) => {
        if (Array.isArray(prev) && (leaves.length < (prev.length || 0))) {
          // Ignore transient shrink to preserve pagination dataset
          return prev;
        }
        return leaves;
      });
    } else if (!leavesLoading) {
      // When hook intentionally returns empty (e.g., non-operation user), clear cache
      setCachedLeaves([]);
    }
  }, [leaves, leavesLoading]);

  // Reset to first page when filters change (client-side only)
  useEffect(() => {
    setLeavesCurrentPage(1);
  }, [statusFilter, searchTerm]);

  const isLocalMode = true;
  const sourceLeaves = (Array.isArray(leaves) && leaves.length > 0) ? leaves : cachedLeaves;
  const backendIsOperation = typeof departmentContext === 'string' && departmentContext.toLowerCase().includes('operation');
  const filteredLeaves = isLocalMode
    ? (sourceLeaves || []).filter((leave) => {
        const statusMatch = statusFilter === "all" || leave.status === statusFilter;
        const term = (searchTerm || "").toLowerCase();
        const typeText = (
          leave?.leaveType || leave?.type || leave?.leaveType?.name || ""
        )
          .toString()
          .toLowerCase();
        const deptText = (
          leave?.department ||
          leave?.departmentName ||
          leave?.employee?.department ||
          leave?.employee?.departmentName ||
          leave?.employee?.department?.name ||
          ""
        )
          .toString()
          .toLowerCase();
        const searchMatch =
          !term ||
          leave.employee?.firstName?.toLowerCase().includes(term) ||
          leave.employee?.lastName?.toLowerCase().includes(term) ||
          typeText.includes(term) ||
          leave.reason?.toLowerCase().includes(term);
        const hasDept = deptText.trim().length > 0;
        const deptMatch = !hasDept ||
          deptText.includes("operation") ||
          deptText.includes("operations") ||
          deptText.includes("ops");
        return statusMatch && searchMatch && deptMatch;
      })
    : (sourceLeaves || []);

  const handleStatusFilterChange = (newStatus) => {
    setStatusFilter(newStatus);
    setLeavesCurrentPage(1);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setLeavesCurrentPage(1);
  };

  const handleEditLeave = (leave) => {
    setSelectedLeave(leave);
    setEditFormData({ status: leave.status });
    setShowEditModal(true);
  };

  const handleDeleteLeave = (leave) => {
    setSelectedLeave(leave);
    setShowDeleteModal(true);
  };

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [editFormData, setEditFormData] = useState({ status: "" });

  const getStatusDisplay = (status) => {
    switch (status) {
      case "approved":
        return { color: "#10b981", icon: CheckCircle, text: "Approved" };
      case "rejected":
        return { color: "#ef4444", icon: XCircle, text: "Rejected" };
      case "pending":
        return { color: "#f59e0b", icon: Clock, text: "Pending" };
      default:
        return { color: "#6b7280", icon: AlertCircle, text: "Unknown" };
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1;
  };

  const handleUpdateLeaveStatus = async () => {
    try {
      await updateLeaveStatus(selectedLeave._id, editFormData);
      showSuccess("Leave status updated successfully");
      setShowEditModal(false);
      setSelectedLeave(null);
    } catch (error) {
      showError("Failed to update leave status: " + error.message);
    }
  };

  const handleDeleteLeaveConfirm = async () => {
    try {
      await deleteLeave(selectedLeave._id);
      showSuccess("Leave deleted successfully");
      setShowDeleteModal(false);
      setSelectedLeave(null);
    } catch (error) {
      showError("Failed to delete leave: " + error.message);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h2
          style={{
            fontSize: "20px",
            fontWeight: "600",
            color: "#111827",
            marginBottom: "8px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Calendar
            style={{ width: "20px", height: "20px", color: "#3b82f6" }}
          />
          Operation Department Leaves
        </h2>
        <p style={{ color: "#6b7280", fontSize: "14px" }}>
          Manage and review leave requests from Operation department employees
        </p>
      </div>

      <div
        style={{
          display: "flex",
          gap: "16px",
          marginBottom: "24px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div style={{ position: "relative", flex: "1", minWidth: "200px" }}>
          <Search
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              width: "16px",
              height: "16px",
              color: "#9ca3af",
            }}
          />
          <input
            type="text"
            placeholder="Search by employee name, leave type, or reason..."
            value={searchTerm}
            onChange={handleSearch}
            style={{
              width: "100%",
              padding: "8px 12px 8px 40px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "14px",
              outline: "none",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
            onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
          />
        </div>

        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              backgroundColor: "white",
              cursor: "pointer",
              fontSize: "14px",
              color: "#374151",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.borderColor = "#3b82f6")}
            onMouseLeave={(e) => (e.target.style.borderColor = "#d1d5db")}
          >
            <Filter style={{ width: "16px", height: "16px" }} />
            Status:{" "}
            {statusFilter === "all"
              ? "All"
              : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
          </button>

          {showStatusDropdown && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                backgroundColor: "white",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                zIndex: 10,
                marginTop: "4px",
              }}
            >
              {[
                { value: "all", label: "All Status" },
                { value: "pending", label: "Pending" },
                { value: "approved", label: "Approved" },
                { value: "rejected", label: "Rejected" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    handleStatusFilterChange(option.value);
                    setShowStatusDropdown(false);
                  }}
                  style={{
                    width: "100%",
                    padding: "8px 16px",
                    textAlign: "left",
                    border: "none",
                    backgroundColor:
                      statusFilter === option.value ? "#f3f4f6" : "transparent",
                    cursor: "pointer",
                    fontSize: "14px",
                    color: "#374151",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.backgroundColor = "#f9fafb")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.backgroundColor =
                      statusFilter === option.value ? "#f3f4f6" : "transparent")
                  }
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {leavesLoading && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "40px",
            color: "#6b7280",
          }}
        >
          <div
            style={{
              width: "24px",
              height: "24px",
              border: "2px solid #e5e7eb",
              borderTop: "2px solid #3b82f6",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              marginRight: "8px",
            }}
          />
          Loading leaves...
        </div>
      )}

      {leavesError && (
        <div
          style={{
            padding: "16px",
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "8px",
            color: "#dc2626",
            marginBottom: "16px",
          }}
        >
          Error loading leaves: {leavesError}
        </div>
      )}

      {!leavesError && (
        <>
          {(filteredLeaves || []).length === 0 && !leavesLoading ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px",
                color: "#6b7280",
                backgroundColor: "white",
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
                marginTop: "20px",
              }}
            >
              <Calendar
                style={{
                  width: "48px",
                  height: "48px",
                  margin: "0 auto 16px",
                  opacity: 0.5,
                }}
              />
              <h3 style={{ fontSize: "18px", marginBottom: "8px" }}>
                No leaves found
              </h3>
              <p>No leave requests match your current filters.</p>
            </div>
          ) : (
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
                overflow: "hidden",
              }}
            >
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr
                      style={{
                        backgroundColor: "#f9fafb",
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      <th
                        style={{
                          padding: "12px 16px",
                          textAlign: "left",
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "#374151",
                        }}
                      >
                        Employee
                      </th>
                      <th
                        style={{
                          padding: "12px 16px",
                          textAlign: "left",
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "#374151",
                        }}
                      >
                        Leave Type
                      </th>
                      <th
                        style={{
                          padding: "12px 16px",
                          textAlign: "left",
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "#374151",
                        }}
                      >
                        Duration
                      </th>
                      <th
                        style={{
                          padding: "12px 16px",
                          textAlign: "left",
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "#374151",
                        }}
                      >
                        Status
                      </th>
                      <th
                        style={{
                          padding: "12px 16px",
                          textAlign: "left",
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "#374151",
                        }}
                      >
                        Applied Date
                      </th>
                      <th
                        style={{
                          padding: "12px 16px",
                          textAlign: "center",
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "#374151",
                        }}
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const total = filteredLeaves.length;
                      const totalPages = Math.max(1, Math.ceil(total / pageSize));
                      const page = Math.min(Math.max(1, leavesCurrentPage), totalPages);
                      const start = (page - 1) * pageSize;
                      const end = start + pageSize;
                      const paginated = filteredLeaves.slice(start, end);
                      return paginated.map((leave) => {
                        const statusDisplay = getStatusDisplay(leave.status);
                        const StatusIcon = statusDisplay.icon;
                        return (
                          <tr key={leave._id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                            <td style={{ padding: "12px 16px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <div
                                  style={{
                                    width: "32px",
                                    height: "32px",
                                    borderRadius: "50%",
                                    backgroundColor: "#3b82f6",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "white",
                                    fontSize: "12px",
                                    fontWeight: "600",
                                  }}
                                >
                                  {leave.employee?.firstName?.charAt(0)}
                                  {leave.employee?.lastName?.charAt(0)}
                                </div>
                                <div>
                                  <div style={{ fontWeight: "500", color: "#1f2937" }}>
                                    {leave.employee?.firstName} {leave.employee?.lastName}
                                  </div>
                                  <div style={{ fontSize: "12px", color: "#6b7280" }}>
                                    {leave.employee?.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: "12px 16px" }}>
                              <div style={{ fontWeight: "500", color: "#1f2937" }}>
                                {leave?.leaveType || leave?.type || leave?.leaveType?.name || "-"}
                              </div>
                              {leave.reason && (
                                <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>
                                  {leave.reason.length > 50
                                    ? `${leave.reason.substring(0, 50)}...`
                                    : leave.reason}
                                </div>
                              )}
                            </td>
                            <td style={{ padding: "12px 16px" }}>
                              <div style={{ fontWeight: "500", color: "#1f2937" }}>
                                {calculateDuration(leave.startDate, leave.endDate)} days
                              </div>
                              <div style={{ fontSize: "12px", color: "#6b7280" }}>
                                {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                              </div>
                            </td>
                            <td style={{ padding: "12px 16px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: statusDisplay.color, fontWeight: "500" }}>
                                <StatusIcon style={{ width: "16px", height: "16px" }} />
                                {statusDisplay.text}
                              </div>
                            </td>
                            <td style={{ padding: "12px 16px", color: "#6b7280", fontSize: "14px" }}>
                              {formatDate(leave.createdAt)}
                            </td>
                            <td style={{ padding: "12px 16px", textAlign: "center" }}>
                              <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                                <button
                                  onClick={() => handleEditLeave(leave)}
                                  style={{
                                    padding: "6px",
                                    border: "1px solid #d1d5db",
                                    borderRadius: "6px",
                                    backgroundColor: "white",
                                    cursor: "pointer",
                                    color: "#374151",
                                    transition: "all 0.2s",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.target.style.borderColor = "#3b82f6";
                                    e.target.style.color = "#3b82f6";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.target.style.borderColor = "#d1d5db";
                                    e.target.style.color = "#374151";
                                  }}
                                  title="Edit Leave"
                                >
                                  <Edit3 style={{ width: "16px", height: "16px" }} />
                                </button>
                                <button
                                  onClick={() => handleDeleteLeave(leave)}
                                  style={{
                                    padding: "6px",
                                    border: "1px solid #d1d5db",
                                    borderRadius: "6px",
                                    backgroundColor: "white",
                                    cursor: "pointer",
                                    color: "#374151",
                                    transition: "all 0.2s",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.target.style.borderColor = "#ef4444";
                                    e.target.style.color = "#ef4444";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.target.style.borderColor = "#d1d5db";
                                    e.target.style.color = "#374151";
                                  }}
                                  title="Delete Leave"
                                >
                                  <Trash2 style={{ width: "16px", height: "16px" }} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {(filteredLeaves || []).length > 0 && (
            <div style={{ marginTop: "24px" }}>
              <SimplePagination
                currentPage={leavesCurrentPage}
                totalPages={Math.max(1, Math.ceil((filteredLeaves?.length || 0) / pageSize))}
                onPageChange={(page) => {
                  setLeavesCurrentPage(page);
                }}
                pageSize={pageSize}
                totalItems={filteredLeaves?.length || 0}
                showPageSizeSelector={false}
              />
            </div>
          )}
        </>
      )}

      {showEditModal && selectedLeave && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "24px",
              width: "90%",
              maxWidth: "500px",
              maxHeight: "90vh",
              overflow: "auto",
            }}
          >
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "600",
                marginBottom: "16px",
              }}
            >
              Update Leave Status
            </h3>
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  marginBottom: "8px",
                }}
              >
                Employee: {selectedLeave.employee?.firstName}{" "}
                {selectedLeave.employee?.lastName}
              </label>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  marginBottom: "8px",
                }}
              >
                Leave Type: {selectedLeave.leaveType}
              </label>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  marginBottom: "8px",
                }}
              >
                Duration:{" "}
                {calculateDuration(
                  selectedLeave.startDate,
                  selectedLeave.endDate
                )}{" "}
                days
              </label>
            </div>
            <div style={{ marginBottom: "24px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  marginBottom: "8px",
                }}
              >
                Status
              </label>
              <select
                value={editFormData.status}
                onChange={(e) => setEditFormData({ status: e.target.value })}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "14px",
                }}
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setShowEditModal(false)}
                style={{
                  padding: "8px 16px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  backgroundColor: "white",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateLeaveStatus}
                style={{
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: "6px",
                  backgroundColor: "#059669",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && selectedLeave && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "24px",
              width: "90%",
              maxWidth: "400px",
            }}
          >
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "600",
                marginBottom: "16px",
                color: "#dc2626",
              }}
            >
              Delete Leave Request
            </h3>
            <p style={{ marginBottom: "24px", color: "#6b7280" }}>
              Are you sure you want to delete this leave request for{" "}
              <strong>
                {selectedLeave.employee?.firstName}{" "}
                {selectedLeave.employee?.lastName}
              </strong>
              ? This action cannot be undone.
            </p>
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{
                  padding: "8px 16px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  backgroundColor: "white",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteLeaveConfirm}
                style={{
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: "6px",
                  backgroundColor: "#dc2626",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Delete Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OperationLeavesManagement;
