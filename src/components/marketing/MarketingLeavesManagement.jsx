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
import { useMarketingLeaves } from "../../hooks/useMarketingData";
import { useNotification } from "../../contexts/NotificationContext";
import SimplePagination from "../common/SimplePagination";

const MarketingLeavesManagement = ({ departmentId = null }) => {
  const { showSuccess, showError } = useNotification();

  // Pagination state
  const [leavesCurrentPage, setLeavesCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Filter and search state
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [editFormData, setEditFormData] = useState({ status: "" });

  const {
    leaves,
    loading: leavesLoading,
    error: leavesError,
    fetchLeaves,
    updateLeaveStatus,
    deleteLeave,
  } = useMarketingLeaves();

  // Fetch once with large page size for client-side filtering/pagination
  useEffect(() => {
    if (typeof fetchLeaves === "function") {
      fetchLeaves(departmentId, 1, 1000, null, null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [departmentId]);

  // Defensive cache to avoid transient backend shrink resetting pagination
  const [cachedLeaves, setCachedLeaves] = useState([]);
  useEffect(() => {
    if (Array.isArray(leaves) && leaves.length > 0) {
      setCachedLeaves((prev) => {
        if (Array.isArray(prev) && (leaves.length < (prev.length || 0))) {
          return prev;
        }
        return leaves;
      });
    }
  }, [leaves]);

  // Client-side filtering includes search + status
  const sourceLeaves = (Array.isArray(leaves) && leaves.length > 0) ? leaves : cachedLeaves;
  const filteredLeaves = Array.isArray(sourceLeaves)
    ? sourceLeaves.filter((leave) => {
        const term = (searchTerm || "").toLowerCase();
        const typeText = (
          leave?.leaveType || leave?.type || leave?.leaveType?.name || ""
        )
          .toString()
          .toLowerCase();

        const searchMatch =
          !term ||
          (leave.employee &&
            ((leave.employee.firstName || "").toLowerCase().includes(term) ||
              (leave.employee.lastName || "").toLowerCase().includes(term))) ||
          typeText.includes(term) ||
          (leave.reason || "").toLowerCase().includes(term);

        const statusMatch =
          statusFilter === "all" || String(leave.status || "").toLowerCase() === String(statusFilter);

        return searchMatch && statusMatch;
      })
    : [];

  // Compute pagination helpers to keep UI stable
  const totalFiltered = Array.isArray(filteredLeaves) ? filteredLeaves.length : 0;
  const computedTotalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const computedCurrentPage = Math.min(
    Math.max(1, leavesCurrentPage),
    computedTotalPages
  );

  // Clamp current page when data shrinks/expands (e.g., after delete/update)
  useEffect(() => {
    if (leavesCurrentPage !== computedCurrentPage) {
      setLeavesCurrentPage(computedCurrentPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalFiltered, pageSize]);

  const handleStatusFilterChange = (newStatus) => {
    setStatusFilter(newStatus);
    setLeavesCurrentPage(1);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value || "");
    setLeavesCurrentPage(1);
  };

  const handleEditLeave = (leave) => {
    setSelectedLeave(leave);
    setEditFormData({ status: leave.status || "pending" });
    setShowEditModal(true);
  };

  const handleDeleteLeave = (leave) => {
    setSelectedLeave(leave);
    setShowDeleteModal(true);
  };

  const handleUpdateLeaveStatus = async () => {
    try {
      await updateLeaveStatus(selectedLeave._id, editFormData);
      showSuccess("Leave status updated successfully");
      setShowEditModal(false);
      setSelectedLeave(null);
    } catch (err) {
      showError("Failed to update leave status: " + (err.message || err));
    }
  };

  const handleDeleteLeaveConfirm = async () => {
    try {
      await deleteLeave(selectedLeave._id);
      showSuccess("Leave deleted successfully");
      setShowDeleteModal(false);
      setSelectedLeave(null);
    } catch (err) {
      showError("Failed to delete leave: " + (err.message || err));
    }
  };

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
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "";
    }
  };

  const calculateDuration = (startDate, endDate) => {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays + 1;
    } catch {
      return "";
    }
  };

  return (
    <div>
      {/* Header */}
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
          Marketing Leaves
        </h2>
        <p style={{ color: "#6b7280", fontSize: "14px" }}>
          Manage and review leave requests from Marketing department employees
        </p>
      </div>

      {/* Filters and Search */}
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

      {!leavesLoading && !leavesError && (
        <>
          {filteredLeaves.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px",
                color: "#6b7280",
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
                          <tr
                            key={leave._id}
                            style={{ borderBottom: "1px solid #f3f4f6" }}
                          >
                            <td style={{ padding: "12px 16px" }}>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                }}
                              >
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
                                  {(leave.employee?.firstName || "").charAt(0)}
                                  {(leave.employee?.lastName || "").charAt(0)}
                                </div>
                                <div>
                                  <div
                                    style={{
                                      fontWeight: "500",
                                      color: "#1f2937",
                                    }}
                                  >
                                    {leave.employee?.firstName}{" "}
                                    {leave.employee?.lastName}
                                  </div>
                                  <div
                                    style={{
                                      fontSize: "12px",
                                      color: "#6b7280",
                                    }}
                                  >
                                    {leave.employee?.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: "12px 16px" }}>
                              <div
                                style={{ fontWeight: "500", color: "#1f2937" }}
                              >
                                {leave?.leaveType || leave?.type || leave?.leaveType?.name || "-"}
                              </div>
                              {leave.reason && (
                                <div
                                  style={{
                                    fontSize: "12px",
                                    color: "#6b7280",
                                    marginTop: "2px",
                                  }}
                                >
                                  {leave.reason.length > 50
                                    ? `${leave.reason.substring(0, 50)}...`
                                    : leave.reason}
                                </div>
                              )}
                            </td>
                            <td style={{ padding: "12px 16px" }}>
                              <div
                                style={{ fontWeight: "500", color: "#1f2937" }}
                              >
                                {calculateDuration(
                                  leave.startDate,
                                  leave.endDate
                                )}{" "}
                                days
                              </div>
                              <div
                                style={{
                                  fontSize: "12px",
                                  color: "#6b7280",
                                  marginTop: "2px",
                                }}
                              >
                                {formatDate(leave.startDate)} -{" "}
                                {formatDate(leave.endDate)}
                              </div>
                            </td>
                            <td style={{ padding: "12px 16px" }}>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                }}
                              >
                                <StatusIcon
                                  style={{
                                    color: statusDisplay.color,
                                    width: "18px",
                                    height: "18px",
                                  }}
                                />
                                <div
                                  style={{
                                    fontWeight: "500",
                                    color: "#1f2937",
                                  }}
                                >
                                  {statusDisplay.text}
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: "12px 16px" }}>
                              {formatDate(
                                leave.createdAt ||
                                  leave.appliedAt ||
                                  leave.appliedDate
                              )}
                            </td>
                            <td
                              style={{
                                padding: "12px 16px",
                                textAlign: "center",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  gap: "8px",
                                  justifyContent: "center",
                                }}
                              >
                                <button
                                  onClick={() => handleEditLeave(leave)}
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    padding: "8px",
                                    borderRadius: "8px",
                                    border: "1px solid #d1d5db",
                                    backgroundColor: "white",
                                    cursor: "pointer",
                                  }}
                                  title="Edit Status"
                                >
                                  <Edit3
                                    style={{ width: "16px", height: "16px" }}
                                  />
                                </button>
                                <button
                                  onClick={() => handleDeleteLeave(leave)}
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    padding: "8px",
                                    borderRadius: "8px",
                                    border: "1px solid #d1d5db",
                                    backgroundColor: "white",
                                    cursor: "pointer",
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
                                  <Trash2
                                    style={{ width: "16px", height: "16px" }}
                                  />
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

          {filteredLeaves.length > 0 && (
            <div style={{ marginTop: "24px" }}>
              <SimplePagination
                currentPage={computedCurrentPage}
                totalPages={computedTotalPages}
                onPageChange={(page) => {
                  setLeavesCurrentPage(page);
                }}
                pageSize={pageSize}
                totalItems={totalFiltered}
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
            backgroundColor: "rgba(0,0,0,0.5)",
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
              width: "420px",
              padding: "16px",
            }}
          >
            <h3 style={{ marginBottom: "8px" }}>Update Leave Status</h3>
            <div style={{ marginBottom: "12px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  color: "#374151",
                }}
              >
                Status
              </label>
              <select
                value={editFormData.status}
                onChange={(e) =>
                  setEditFormData((p) => ({ ...p, status: e.target.value }))
                }
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
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
                justifyContent: "flex-end",
                gap: "8px",
              }}
            >
              <button
                onClick={() => setShowEditModal(false)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  background: "white",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateLeaveStatus}
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#1c242e",
                  color: "white",
                }}
              >
                Save
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
            backgroundColor: "rgba(0,0,0,0.5)",
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
              width: "420px",
              padding: "16px",
            }}
          >
            <h3 style={{ marginBottom: "8px" }}>Delete Leave</h3>
            <p style={{ color: "#6b7280" }}>
              Are you sure you want to delete this leave request?
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "8px",
              }}
            >
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  background: "white",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteLeaveConfirm}
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#ef4444",
                  color: "white",
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketingLeavesManagement;
