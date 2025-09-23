import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";

const COMMUNITIES = [
  { id: 1, name: "Public Works Department" },
  { id: 2, name: "Sanitation Department" },
  { id: 3, name: "Parks and Recreation Department" },
  { id: 4, name: "Water and Sewer Department" },
  { id: 5, name: "Code Enforcement / Building Department" },
  { id: 6, name: "Forestry / Urban Forestry Division" },
  { id: 7, name: "Electrical & Streetlight Department" },
  { id: 8, name: "Traffic & Transport Department" },
  { id: 9, name: "Public Health & Pest Control" },
];

const ROLES = [
  { value: "user", label: "User" },
  { value: "admin", label: "Admin" },
];

export default function Register() {
  const router = useRouter();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
    departmentName: "", // changed from communityId
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showCommunityModal, setShowCommunityModal] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) newErrors.username = "Username is required";

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) newErrors.password = "Password is required";

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (formData.role === "admin" && !formData.departmentName) {
      newErrors.departmentName = "Please select a department for admin role";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));

    if (field === "role" && value !== "admin") {
      setFormData(prev => ({ ...prev, departmentName: "" }));
      if (errors.departmentName) setErrors(prev => ({ ...prev, departmentName: "" }));
    }
  };

  const selectRole = (roleValue) => {
    updateField("role", roleValue);
    setShowRoleModal(false);
  };

  const selectCommunity = (departmentName) => {
    updateField("departmentName", departmentName);
    setShowCommunityModal(false);
  };

  const getSelectedRoleLabel = () => {
    const role = ROLES.find(r => r.value === formData.role);
    return role ? role.label : "Select Role";
  };

  const getSelectedCommunityName = () => {
    return formData.departmentName || "Select Department";
  };

  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "user",
      departmentName: "",
    });
    setErrors({});
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      Alert.alert("Validation Error", "Please fix the errors in the form");
      return;
    }

    setLoading(true);
    try {
      const registrationData = {
        username: formData.username.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        role: formData.role,
        ...(formData.role === "admin" && { departmentName: formData.departmentName }),
      };

      // Call register function from your AuthContext
      await register(registrationData);

      Alert.alert(
        "Registration Successful",
        `Welcome ${formData.username}! Your account has been created successfully.`,
        [
          {
            text: "Continue",
            onPress: () => {
              resetForm();
              router.replace("/(auth)/login");
            },
          },
        ]
      );
    } catch (error) {
      console.error("Registration error:", error);
      let errorMessage = error.message || "Registration failed. Please try again.";

      if (error.message.includes("email")) setErrors({ email: "Email already exists" });
      else if (error.message.includes("username")) setErrors({ username: "Username already taken" });

      Alert.alert("Registration Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join our community platform</Text>
          </View>

          <View style={styles.form}>
            {/* Username */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Username *</Text>
              <TextInput
                style={[styles.input, errors.username && styles.inputError]}
                placeholder="Enter your username"
                value={formData.username}
                onChangeText={(text) => updateField("username", text)}
                autoCapitalize="none"
              />
              {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
            </View>

            {/* Email */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="Enter your email"
                value={formData.email}
                onChangeText={(text) => updateField("email", text)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {/* Password */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password *</Text>
              <TextInput
                style={[styles.input, errors.password && styles.inputError]}
                placeholder="Enter your password"
                value={formData.password}
                onChangeText={(text) => updateField("password", text)}
                secureTextEntry
              />
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            {/* Confirm Password */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm Password *</Text>
              <TextInput
                style={[styles.input, errors.confirmPassword && styles.inputError]}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChangeText={(text) => updateField("confirmPassword", text)}
                secureTextEntry
              />
              {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
            </View>

            {/* Role */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Role *</Text>
              <TouchableOpacity
                style={[styles.selector, errors.role && styles.inputError]}
                onPress={() => setShowRoleModal(true)}
              >
                <Text style={styles.selectorText}>{getSelectedRoleLabel()}</Text>
                <Text style={styles.arrow}>▼</Text>
              </TouchableOpacity>
            </View>

            {/* Department for admin */}
            {formData.role === "admin" && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Department *</Text>
                <TouchableOpacity
                  style={[styles.selector, errors.departmentName && styles.inputError]}
                  onPress={() => setShowCommunityModal(true)}
                >
                  <Text style={styles.selectorText}>{getSelectedCommunityName()}</Text>
                  <Text style={styles.arrow}>▼</Text>
                </TouchableOpacity>
                {errors.departmentName && <Text style={styles.errorText}>{errors.departmentName}</Text>}
              </View>
            )}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.buttonText}>{loading ? "Creating Account..." : "Create Account"}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.clearButton} onPress={resetForm} disabled={loading}>
              <Text style={styles.clearButtonText}>Clear Form</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.linkContainer}>
            <Text style={styles.linkText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.link}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Role Modal */}
      <Modal visible={showRoleModal} transparent animationType="slide" onRequestClose={() => setShowRoleModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowRoleModal(false)}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Select Your Role</Text>
            {ROLES.map((role) => (
              <TouchableOpacity
                key={role.value}
                style={[styles.modalOption, formData.role === role.value && styles.selectedOption]}
                onPress={() => selectRole(role.value)}
              >
                <Text style={[styles.modalOptionText, formData.role === role.value && styles.selectedOptionText]}>
                  {role.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Department Modal */}
      <Modal visible={showCommunityModal} transparent animationType="slide" onRequestClose={() => setShowCommunityModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowCommunityModal(false)}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Select Department</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              {COMMUNITIES.map((community) => (
                <TouchableOpacity
                  key={community.id}
                  style={[styles.modalOption, formData.departmentName === community.name && styles.selectedOption]}
                  onPress={() => selectCommunity(community.name)}
                >
                  <Text style={[styles.modalOptionText, formData.departmentName === community.name && styles.selectedOptionText]}>
                    {community.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  formContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    overflow: "hidden",
  },
  header: {
    padding: 30,
    paddingBottom: 20,
    backgroundColor: "#007bff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: "white",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "rgba(255, 255, 255, 0.9)",
  },
  form: {
    padding: 30,
    paddingTop: 25,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e1e5e9",
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    backgroundColor: "#f8f9fa",
    color: "#333",
  },
  selector: {
    borderWidth: 1,
    borderColor: "#e1e5e9",
    borderRadius: 12,
    padding: 15,
    backgroundColor: "#f8f9fa",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectorText: {
    fontSize: 16,
    color: "#6c757d",
    flex: 1,
  },
  selectedText: {
    color: "#333",
    fontWeight: "500",
  },
  arrow: {
    fontSize: 12,
    color: "#6c757d",
    marginLeft: 10,
  },
  inputError: {
    borderColor: "#dc3545",
    backgroundColor: "#fff5f5",
  },
  errorText: {
    color: "#dc3545",
    fontSize: 14,
    marginTop: 5,
    fontWeight: "500",
  },
  helpText: {
    color: "#6c757d",
    fontSize: 13,
    marginTop: 5,
    fontStyle: "italic",
  },
  buttonContainer: {
    padding: 30,
    paddingTop: 10,
  },
  button: {
    backgroundColor: "#007bff",
    padding: 18,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#007bff",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    backgroundColor: "#6c757d",
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  clearButton: {
    padding: 15,
    borderRadius: 12,
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#e1e5e9",
  },
  clearButtonText: {
    color: "#6c757d",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  linkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingBottom: 30,
  },
  linkText: {
    fontSize: 16,
    color: "#6c757d",
  },
  link: {
    fontSize: 16,
    color: "#007bff",
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 25,
    maxHeight: "80%",
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: "#333",
  },
  modalSubtitle: {
    fontSize: 14,
    textAlign: "center",
    color: "#6c757d",
    marginBottom: 25,
  },
  modalScroll: {
    maxHeight: 300,
    marginBottom: 20,
  },
  modalOption: {
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f3f4",
    borderRadius: 8,
    marginBottom: 5,
  },
  selectedOption: {
    backgroundColor: "#e3f2fd",
    borderColor: "#007bff",
    borderWidth: 1,
    borderBottomWidth: 1,
  },
  modalOptionText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  selectedOptionText: {
    color: "#007bff",
    fontWeight: "600",
  },
  roleDescription: {
    fontSize: 13,
    color: "#6c757d",
    marginTop: 4,
    fontStyle: "italic",
  },
  modalCancel: {
    marginTop: 15,
    padding: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e1e5e9",
  },
  modalCancelText: {
    fontSize: 16,
    color: "#6c757d",
    textAlign: "center",
    fontWeight: "500",
  },
});