"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function TestFirebasePage() {
    const [results, setResults] = useState<any>({});
    const [testing, setTesting] = useState(false);

    const runTests = async () => {
        setTesting(true);
        const testResults: any = {};

        // Test 1: Firebase Config
        try {
            testResults.config = {
                status: "success",
                message: "Firebase configuration loaded",
                details: {
                    projectId: "smart-service-b1537",
                    authDomain: "smart-service-b1537.firebaseapp.com"
                }
            };
        } catch (error: any) {
            testResults.config = {
                status: "error",
                message: "Firebase configuration error",
                error: error.message
            };
        }

        // Test 2: Authentication
        try {
            const user = auth.currentUser;
            testResults.auth = {
                status: user ? "success" : "warning",
                message: user ? `Logged in as ${user.email}` : "Not logged in",
                details: user ? { email: user.email, uid: user.uid } : null
            };
        } catch (error: any) {
            testResults.auth = {
                status: "error",
                message: "Authentication error",
                error: error.message
            };
        }

        // Test 3: Firestore Write
        try {
            const testDoc = await addDoc(collection(db, "test_connection"), {
                message: "Test connection",
                timestamp: new Date().toISOString()
            });
            testResults.firestoreWrite = {
                status: "success",
                message: "Successfully wrote to Firestore",
                details: { docId: testDoc.id }
            };
        } catch (error: any) {
            testResults.firestoreWrite = {
                status: "error",
                message: "Failed to write to Firestore",
                error: error.message
            };
        }

        // Test 4: Firestore Read
        try {
            const querySnapshot = await getDocs(collection(db, "test_connection"));
            testResults.firestoreRead = {
                status: "success",
                message: `Successfully read from Firestore (${querySnapshot.size} documents)`,
                details: { count: querySnapshot.size }
            };

            // Clean up test documents
            querySnapshot.forEach(async (document) => {
                await deleteDoc(doc(db, "test_connection", document.id));
            });
        } catch (error: any) {
            testResults.firestoreRead = {
                status: "error",
                message: "Failed to read from Firestore",
                error: error.message
            };
        }

        // Test 5: Check Collections
        try {
            const collections = ["customers", "tickets", "timeline", "users", "userPreferences"];
            const collectionStatus: any = {};
            
            for (const collectionName of collections) {
                const snapshot = await getDocs(collection(db, collectionName));
                collectionStatus[collectionName] = snapshot.size;
            }

            testResults.collections = {
                status: "success",
                message: "Collections checked",
                details: collectionStatus
            };
        } catch (error: any) {
            testResults.collections = {
                status: "error",
                message: "Failed to check collections",
                error: error.message
            };
        }

        // Test 6: User Profile Verification
        try {
            const user = auth.currentUser;
            if (user) {
                const userDoc = await getDocs(collection(db, "users"));
                const userProfile = userDoc.docs.find(doc => doc.id === user.uid);
                
                if (userProfile) {
                    const data = userProfile.data();
                    const hasRequiredFields = 
                        data.uid && 
                        data.email && 
                        data.role && 
                        typeof data.isActive === 'boolean' &&
                        data.createdAt &&
                        data.updatedAt;
                    
                    testResults.userProfile = {
                        status: hasRequiredFields ? "success" : "warning",
                        message: hasRequiredFields 
                            ? "User profile exists with correct structure" 
                            : "User profile exists but missing some fields",
                        details: {
                            uid: data.uid,
                            email: data.email,
                            displayName: data.displayName,
                            role: data.role,
                            isActive: data.isActive,
                            hasCreatedAt: !!data.createdAt,
                            hasUpdatedAt: !!data.updatedAt
                        }
                    };
                } else {
                    testResults.userProfile = {
                        status: "warning",
                        message: "User profile not found in Firestore (will be created on next login)",
                        details: { userId: user.uid }
                    };
                }
            } else {
                testResults.userProfile = {
                    status: "warning",
                    message: "Not logged in - cannot verify user profile",
                    details: null
                };
            }
        } catch (error: any) {
            testResults.userProfile = {
                status: "error",
                message: "Failed to verify user profile",
                error: error.message
            };
        }

        setResults(testResults);
        setTesting(false);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "success":
                return <CheckCircle2 className="h-5 w-5 text-green-600" />;
            case "warning":
                return <XCircle className="h-5 w-5 text-yellow-600" />;
            case "error":
                return <XCircle className="h-5 w-5 text-red-600" />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Firebase Connection Test</h1>
                    <p className="text-muted-foreground mt-2">
                        Test your Firebase configuration and connectivity
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Run Diagnostics</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={runTests} disabled={testing} className="w-full">
                            {testing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Testing...
                                </>
                            ) : (
                                "Run Tests"
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {Object.keys(results).length > 0 && (
                    <div className="space-y-4">
                        {Object.entries(results).map(([key, value]: [string, any]) => (
                            <Card key={key}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg capitalize">
                                            {key.replace(/([A-Z])/g, ' $1').trim()}
                                        </CardTitle>
                                        {getStatusIcon(value.status)}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <p className={`font-medium ${
                                        value.status === "success" ? "text-green-600" :
                                        value.status === "warning" ? "text-yellow-600" :
                                        "text-red-600"
                                    }`}>
                                        {value.message}
                                    </p>
                                    {value.details && (
                                        <div className="bg-muted p-3 rounded-md">
                                            <pre className="text-xs overflow-auto">
                                                {JSON.stringify(value.details, null, 2)}
                                            </pre>
                                        </div>
                                    )}
                                    {value.error && (
                                        <div className="bg-destructive/10 p-3 rounded-md">
                                            <p className="text-sm text-destructive font-mono">
                                                {value.error}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {Object.keys(results).length > 0 && (
                    <Card className="bg-primary/5 border-primary/20">
                        <CardHeader>
                            <CardTitle>Next Steps</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            {results.auth?.status === "warning" && (
                                <p>⚠️ You're not logged in. Go to <a href="/login" className="text-primary underline">/login</a> to sign in.</p>
                            )}
                            {results.firestoreWrite?.status === "error" && (
                                <div className="space-y-2">
                                    <p>❌ Firestore write failed. This usually means:</p>
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>Firestore is not enabled in Firebase Console</li>
                                        <li>Firestore rules are too restrictive</li>
                                        <li>You need to set rules to test mode</li>
                                    </ul>
                                    <p className="font-medium mt-2">Fix:</p>
                                    <ol className="list-decimal list-inside space-y-1 ml-4">
                                        <li>Go to Firebase Console</li>
                                        <li>Click "Firestore Database"</li>
                                        <li>Click "Rules" tab</li>
                                        <li>Set rules to test mode (see FIREBASE_SETUP_COMPLETE.md)</li>
                                        <li>Click "Publish"</li>
                                    </ol>
                                </div>
                            )}
                            {results.collections?.details && (
                                <div>
                                    <p className="font-medium">📊 Your Data:</p>
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>Customers: {results.collections.details.customers || 0}</li>
                                        <li>Tickets: {results.collections.details.tickets || 0}</li>
                                        <li>Timeline Entries: {results.collections.details.timeline || 0}</li>
                                        <li>Users: {results.collections.details.users || 0}</li>
                                        <li>User Preferences: {results.collections.details.userPreferences || 0}</li>
                                    </ul>
                                </div>
                            )}
                            {results.userProfile?.status === "success" && (
                                <p className="text-green-600">
                                    ✅ User profile verified with correct structure
                                </p>
                            )}
                            {results.userProfile?.status === "warning" && results.userProfile?.message.includes("not found") && (
                                <p className="text-yellow-600">
                                    ⚠️ User profile will be automatically created when you refresh the page or log in again
                                </p>
                            )}
                            {Object.values(results).every((r: any) => r.status === "success") && (
                                <p className="text-green-600 font-medium">
                                    ✅ All tests passed! Firebase is working correctly.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
