import cv2
import numpy as np
import time
# ---------------------------
# Configuration Parameters
# ---------------------------

EYE_CASCADE_PATH = 'haarcascade_eye.xml'

# Head movement detection parameters
HEAD_MOVEMENT_THRESHOLD = 10  # Minimum pixel movement to register head motion
HEAD_MOVEMENT_FRAMES = 10     # Frames to track for movement

MESSAGE_DURATION = 1.0  # seconds to display messages (Yes/No)

# ---------------------------
# Initialization
# ---------------------------

eye_cascade = cv2.CascadeClassifier(EYE_CASCADE_PATH)
cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("Could not open webcam.")
    exit()

# Track eye positions for head movement detection
eye_positions = []  # Store positions of both eyes for the last few frames
display_message = ""
message_display_time = 0.0

# ---------------------------
# Helper Functions
# ---------------------------

def detect_eyes(gray_frame):
    """
    Detect eyes using the Haar cascade. Returns the bounding boxes of detected eyes.
    """
    eyes = eye_cascade.detectMultiScale(
        gray_frame,
        scaleFactor=1.1,
        minNeighbors=5,
        flags=cv2.CASCADE_SCALE_IMAGE
    )
    return eyes

def track_head_movement(eye_positions):
    """
    Determine if head movement is vertical (Yes) or horizontal (No) based on eye positions.
    """
    if len(eye_positions) < HEAD_MOVEMENT_FRAMES:
        return None  # Not enough data to detect movement

    # Calculate movement vectors for both eyes
    left_eye_positions = [pos[0] for pos in eye_positions]
    right_eye_positions = [pos[1] for pos in eye_positions]

    left_eye_dx = np.diff([pos[0] for pos in left_eye_positions])
    left_eye_dy = np.diff([pos[1] for pos in left_eye_positions])

    right_eye_dx = np.diff([pos[0] for pos in right_eye_positions])
    right_eye_dy = np.diff([pos[1] for pos in right_eye_positions])

    # Average movement across both eyes
    dx = np.mean(left_eye_dx + right_eye_dx)
    dy = np.mean(left_eye_dy + right_eye_dy)

    # Determine movement direction
    if abs(dx) > HEAD_MOVEMENT_THRESHOLD and abs(dy) < HEAD_MOVEMENT_THRESHOLD:
        return "No"  # Horizontal movement
    elif abs(dy) > HEAD_MOVEMENT_THRESHOLD and abs(dx) < HEAD_MOVEMENT_THRESHOLD:
        return "Yes"  # Vertical movement
    else:
        return None

# ---------------------------
# Main Loop
# ---------------------------

while True:
    ret, frame = cap.read()
    if not ret:
        print("Failed to grab frame.")
        break

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    eyes = detect_eyes(gray)

    # Track eye positions for head movement
    if len(eyes) == 2:  # Ensure both eyes are detected
        eye_positions.append([(eyes[0][0], eyes[0][1]), (eyes[1][0], eyes[1][1])])
        if len(eye_positions) > HEAD_MOVEMENT_FRAMES:
            eye_positions.pop(0)  # Keep only recent positions

    # Detect head movement
    movement = track_head_movement(eye_positions)
    if movement:
        display_message = movement
        message_display_time = time.time()
        eye_positions = []  # Reset after detecting a movement

    # Display "Yes" or "No" messages
    current_time = time.time()
    if display_message and (current_time - message_display_time) < MESSAGE_DURATION:
        cv2.putText(frame, display_message, (10, 50), cv2.FONT_HERSHEY_SIMPLEX,
                    1, (0, 0, 255), 2)
    else:
        display_message = ""

    # Draw rectangles around detected eyes
    for (ex, ey, ew, eh) in eyes:
        cv2.rectangle(frame, (ex, ey), (ex+ew, ey+eh), (0, 255, 0), 2)

    cv2.imshow("Head Movement Detection", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
