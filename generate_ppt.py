import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def create_presentation():
    prs = Presentation()
    # Set wide screen 16:9 aspect ratio
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6] # Blank slide

    # Define premium colors
    DARK_BG = RGBColor(15, 23, 42)       # Slate 900
    LIGHT_BG = RGBColor(248, 250, 252)   # Slate 50
    TEXT_DARK = RGBColor(15, 23, 42)     # Slate 900
    TEXT_LIGHT = RGBColor(241, 245, 249) # Slate 100
    TEXT_MUTED = RGBColor(100, 116, 139) # Slate 500
    CARD_BG = RGBColor(255, 255, 255)
    BORDER_COLOR = RGBColor(226, 232, 240) # Slate 200

    # Accent Colors
    ACCENT_TEAL = RGBColor(13, 148, 136)   # Teal 600
    ACCENT_BLUE = RGBColor(14, 165, 233)   # Sky 500
    ACCENT_INDIGO = RGBColor(79, 70, 229) # Indigo 600
    ACCENT_CRIMSON = RGBColor(225, 29, 72) # Rose 600

    # Helper function to add a card shape
    def add_card(slide, left, top, width, height, bg_color=CARD_BG, border_color=BORDER_COLOR):
        card = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = bg_color
        if border_color:
            card.line.color.rgb = border_color
            card.line.width = Pt(1.5)
        else:
            card.line.fill.background()
        return card

    # Helper function to write text inside card containers
    def add_card_text(slide, left, top, width, height, title, body_bullets, title_color=TEXT_DARK, title_size=18, body_size=13):
        # Position textbox with margins inside the card
        tb = slide.shapes.add_textbox(left + Inches(0.2), top + Inches(0.2), width - Inches(0.4), height - Inches(0.4))
        tf = tb.text_frame
        tf.word_wrap = True
        
        # Title
        p_title = tf.paragraphs[0]
        p_title.text = title
        p_title.font.name = 'Segoe UI'
        p_title.font.size = Pt(title_size)
        p_title.font.bold = True
        p_title.font.color.rgb = title_color
        p_title.space_after = Pt(12)
        
        # Bullets
        for bullet in body_bullets:
            p = tf.add_paragraph()
            p.text = bullet
            p.font.name = 'Segoe UI'
            p.font.size = Pt(body_size)
            p.font.color.rgb = TEXT_DARK
            p.level = 0
            p.space_after = Pt(8)

    # Helper function to create content slides with header
    def add_slide_with_header(title_text, accent_color=ACCENT_TEAL):
        slide = prs.slides.add_slide(blank_layout)
        
        # Slide Background
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
        bg.fill.solid()
        bg.fill.fore_color.rgb = LIGHT_BG
        bg.line.fill.background()
        
        # Header Container Card
        header_bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.5), Inches(0.4), Inches(12.333), Inches(0.9))
        header_bar.fill.solid()
        header_bar.fill.fore_color.rgb = CARD_BG
        header_bar.line.color.rgb = BORDER_COLOR
        header_bar.line.width = Pt(1.5)
        
        # Left Accent indicator
        accent_bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.5), Inches(0.4), Inches(0.15), Inches(0.9))
        accent_bar.fill.solid()
        accent_bar.fill.fore_color.rgb = accent_color
        accent_bar.line.fill.background()
        
        # Title Text Box
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.45), Inches(11.5), Inches(0.8))
        tf = title_box.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title_text
        p.font.name = 'Segoe UI'
        p.font.size = Pt(28)
        p.font.bold = True
        p.font.color.rgb = TEXT_DARK
        
        return slide

    # ==========================================
    # SLIDE 1: Title Slide (Dark Theme)
    # ==========================================
    slide1 = prs.slides.add_slide(blank_layout)
    bg1 = slide1.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
    bg1.fill.solid()
    bg1.fill.fore_color.rgb = DARK_BG
    bg1.line.fill.background()

    # Left accent block
    accent_block = slide1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(0.25), prs.slide_height)
    accent_block.fill.solid()
    accent_block.fill.fore_color.rgb = ACCENT_BLUE
    accent_block.line.fill.background()

    tb1 = slide1.shapes.add_textbox(Inches(1.0), Inches(2.0), Inches(11.3), Inches(4.0))
    tf1 = tb1.text_frame
    tf1.word_wrap = True

    p_title = tf1.paragraphs[0]
    p_title.text = "College ERP Dashboard"
    p_title.font.name = 'Segoe UI'
    p_title.font.size = Pt(50)
    p_title.font.bold = True
    p_title.font.color.rgb = TEXT_LIGHT
    p_title.space_after = Pt(8)

    p_sub = tf1.add_paragraph()
    p_sub.text = "A Unified Full-Stack Academic & Operations Management Portal"
    p_sub.font.name = 'Segoe UI'
    p_sub.font.size = Pt(22)
    p_sub.font.color.rgb = ACCENT_BLUE
    p_sub.space_after = Pt(30)

    p_footer = tf1.add_paragraph()
    p_footer.text = "Role-Based Workspaces for Students, Faculty & Administrators\nPowered by React, Node.js, Express, and MySQL"
    p_footer.font.name = 'Segoe UI'
    p_footer.font.size = Pt(14)
    p_footer.font.color.rgb = TEXT_MUTED

    # ==========================================
    # SLIDE 2: Project Overview (2 Columns)
    # ==========================================
    slide2 = add_slide_with_header("Project Overview & Problem Statement", ACCENT_TEAL)
    
    col_w = Inches(5.9)
    col_h = Inches(5.1)
    top_pos = Inches(1.6)

    # Column 1: The Problem
    add_card(slide2, Inches(0.5), top_pos, col_w, col_h)
    add_card_text(
        slide2, Inches(0.5), top_pos, col_w, col_h,
        "The Challenge: Fragmented Systems",
        [
            "Isolated Platforms: Legacy portals run separate databases for academics, fees, housing, library operations, and placements.",
            "Manual Overheads: No Dues clearance, student registration/de-registration, and query resolution are managed on paper.",
            "Relational Friction: Deleting a student doesn't cascade, leaving orphaned rows across other administrative tables.",
            "Poor UI/UX: Legacy designs are cluttered, slow, and lack modern responsive layouts."
        ],
        title_color=ACCENT_CRIMSON
    )

    # Column 2: The Solution
    add_card(slide2, Inches(6.933), top_pos, col_w, col_h)
    add_card_text(
        slide2, Inches(6.933), top_pos, col_w, col_h,
        "The Solution: Unified ERP Console",
        [
            "Consolidated Dashboard: Single platform containing role-based workspaces for Students, Faculty, and Admins.",
            "Dynamic Database Integrity: Direct link to local MySQL instance, ensuring live data sync across all operations.",
            "Automated Administrative Flow: Online fee checkouts, digital clearance toggles, and live ticketing resolution.",
            "Unified UX: Clean, modern dark slate aesthetic with simple, lightweight layout guidelines."
        ],
        title_color=ACCENT_TEAL
    )

    # ==========================================
    # SLIDE 3: System Architecture (3 Columns)
    # ==========================================
    slide3 = add_slide_with_header("Technical Architecture & Core Stack", ACCENT_BLUE)

    col3_w = Inches(3.8)
    col3_h = Inches(5.1)
    col3_spacing = Inches(0.466)
    c1_left = Inches(0.5)
    c2_left = c1_left + col3_w + col3_spacing
    c3_left = c2_left + col3_w + col3_spacing

    # Client Card
    add_card(slide3, c1_left, top_pos, col3_w, col3_h)
    add_card_text(
        slide3, c1_left, top_pos, col3_w, col3_h,
        "Client Layer (React)",
        [
            "Vite + React.js SPA: Fast hot module replacement and builds.",
            "React Router: Restricts frontend access routes by role.",
            "React Context API: Manages global auth state and credentials caching.",
            "Lucide-React: Responsive iconography throughout.",
            "Clean CSS Layouts: Structured layouts designed for accessibility."
        ],
        title_color=ACCENT_BLUE
    )

    # Backend Card
    add_card(slide3, c2_left, top_pos, col3_w, col3_h)
    add_card_text(
        slide3, c2_left, top_pos, col3_w, col3_h,
        "API Service Layer (Node/Express)",
        [
            "Express.js Routing: Modular routes for Auth, Students, Faculty, and Admin.",
            "JWT Authentication: Secure backend validation of sessions.",
            "BcryptJS Hashing: Secures stored user passwords.",
            "CORS & Body Parser: Ready for local server integrations."
        ],
        title_color=ACCENT_INDIGO
    )

    # Database Card
    add_card(slide3, c3_left, top_pos, col3_w, col3_h)
    add_card_text(
        slide3, c3_left, top_pos, col3_w, col3_h,
        "Storage Layer (MySQL)",
        [
            "Relational Schema: 18+ interlinked tables mapping college workflows.",
            "Connection Pool: mysql2/promise for optimal async connection recycling.",
            "Cascading Constraints: Cascade deletions prevent database database corruption.",
            "Safe Seeder: seed.js cleans and rebuilds mock environments in seconds."
        ],
        title_color=ACCENT_TEAL
    )

    # ==========================================
    # SLIDE 4: Student Workspace (4 Columns)
    # ==========================================
    slide4 = add_slide_with_header("Comprehensive Student Workspace (15+ Modules)", ACCENT_INDIGO)

    col4_w = Inches(2.8)
    col4_h = Inches(5.1)
    col4_spacing = Inches(0.377)
    
    # 4 columns coordinates
    c1 = Inches(0.5)
    c2 = c1 + col4_w + col4_spacing
    c3 = c2 + col4_w + col4_spacing
    c4 = c3 + col4_w + col4_spacing

    add_card(slide4, c1, top_pos, col4_w, col4_h)
    add_card_text(
        slide4, c1, top_pos, col4_w, col4_h,
        "Academics & Schedule",
        [
            "Timetable: Check course timing and rooms.",
            "Attendance Tracker: Course-wise presence rate logs.",
            "Course Registrations: Sign up for current semester offerings.",
            "CGPA Dashboard: View grades, term marks, and GPAs."
        ],
        title_size=15, body_size=11
    )

    add_card(slide4, c2, top_pos, col4_w, col4_h)
    add_card_text(
        slide4, c2, top_pos, col4_w, col4_h,
        "Campus Services",
        [
            "Digital Library: Search book records, view borrow history, check due dates, and monitor fines.",
            "Hostel Bookings: Check room allocations, wardens, and mess timings.",
            "Transport Routes: Monitor bus numbers, driver details, and stops."
        ],
        title_size=15, body_size=11
    )

    add_card(slide4, c3, top_pos, col4_w, col4_h)
    add_card_text(
        slide4, c3, top_pos, col4_w, col4_h,
        "Finances & No Dues",
        [
            "Tuition Fees Bills: Monitor outstanding tuition costs.",
            "Fee Payments: Checkout simulation to pay online.",
            "Digital No Dues: Live dashboard displaying clearance statuses (Library, Hostel, Sports, Accounts)."
        ],
        title_size=15, body_size=11
    )

    add_card(slide4, c4, top_pos, col4_w, col4_h)
    add_card_text(
        slide4, c4, top_pos, col4_w, col4_h,
        "Careers & Helpdesk",
        [
            "Placement Board: View jobs, criteria, and packages.",
            "Application Tracker: Track interviewing stages.",
            "Lodge Tickets: Report academic, IT, or infrastructure issues."
        ],
        title_size=15, body_size=11
    )

    # ==========================================
    # SLIDE 5: Faculty Dashboard (3 Columns)
    # ==========================================
    slide5 = add_slide_with_header("Faculty Dashboard & Advisory Console", ACCENT_TEAL)

    add_card(slide5, c1_left, top_pos, col3_w, col3_h)
    add_card_text(
        slide5, c1_left, top_pos, col3_w, col3_h,
        "Teaching Portfolio",
        [
            "Class Management: Displays assigned courses and classes.",
            "Attendance Logger: Check and submit student attendance directly to the MySQL database.",
            "Grade Entry Panel: Input end-term grades for students enrolled in classes."
        ],
        title_color=ACCENT_BLUE
    )

    add_card(slide5, c2_left, top_pos, col3_w, col3_h)
    add_card_text(
        slide5, c2_left, top_pos, col3_w, col3_h,
        "Department Advisory",
        [
            "Add Student: Faculty can register new students directly into their department.",
            "De-register Student: Remove students with a single click (triggering cascade deletes).",
            "Support Helpdesk: Resolve or delete academic support tickets filed by students."
        ],
        title_color=ACCENT_INDIGO
    )

    add_card(slide5, c3_left, top_pos, col3_w, col3_h)
    add_card_text(
        slide5, c3_left, top_pos, col3_w, col3_h,
        "Digital No Dues Toggles",
        [
            "Interactive Board: Shows status profiles of department students.",
            "One-Click Clearances: Toggle Library, Hostel, Sports, and Accounts dues.",
            "Direct Synced Client: Toggles update student portals instantly."
        ],
        title_color=ACCENT_TEAL
    )

    # ==========================================
    # SLIDE 6: Admin Dashboard (2 Columns)
    # ==========================================
    slide6 = add_slide_with_header("Centralized Administrative Console", ACCENT_BLUE)

    add_card(slide6, Inches(0.5), top_pos, col_w, col_h)
    add_card_text(
        slide6, Inches(0.5), top_pos, col_w, col_h,
        "Platform & Course Management",
        [
            "Campus Notices: Admin can draft and post announcements visible to all user groups.",
            "Course Catalog Control: Add, edit, or delete courses across all departments.",
            "Core Analytics: Access key database counts (Total students, faculty, departments).",
            "Relational Integrity: Course updates propagate automatically down to student enrollments."
        ],
        title_color=ACCENT_BLUE
    )

    add_card(slide6, Inches(6.933), top_pos, col_w, col_h)
    add_card_text(
        slide6, Inches(6.933), top_pos, col_w, col_h,
        "User Directory Directory",
        [
            "Core CRUD Operations: Complete directory control over Students, Faculty, and Admin user accounts.",
            "Profile Customizer: Edit user credentials, phone numbers, and designations.",
            "Department Configuration: Manage and add academic departments, setting department codes (e.g. CSE, EE)."
        ],
        title_color=ACCENT_INDIGO
    )

    # ==========================================
    # SLIDE 7: Recent System Refinements (2 Columns)
    # ==========================================
    slide7 = add_slide_with_header("Recent System Refinements & Enhancements", ACCENT_INDIGO)

    add_card(slide7, Inches(0.5), top_pos, col_w, col_h)
    add_card_text(
        slide7, Inches(0.5), top_pos, col_w, col_h,
        "Rebranding & Security Flow",
        [
            "Brand Consolidation: Replaced legacy Ω logo with modern GraduationCap icon across authentication views and sidebars.",
            "Enforced Registration Gateways: Deactivated demo quick-login widgets. Users must register manually, securing realistic login flows.",
            "Mutual Redirections: Added clean routing shortcuts connecting Sign-in and Sign-up panels."
        ],
        title_color=ACCENT_INDIGO
    )

    add_card(slide7, Inches(6.933), top_pos, col_w, col_h)
    add_card_text(
        slide7, Inches(6.933), top_pos, col_w, col_h,
        "Backend & Sync Enhancements",
        [
            "Auto-provisioning: Registrations auto-create default unpaid fee bills, empty hostel allocations, and pending No Dues profiles.",
            "Advisory Integrations: Integrated delete student button with cascading schema deletes, removing enrollments and dues.",
            "Notice Boards Patch: Restructured admin notice route so all logged-in roles can fetch boards without authorization crashes."
        ],
        title_color=ACCENT_TEAL
    )

    # ==========================================
    # SLIDE 8: Deployment Guide (2 Columns)
    # ==========================================
    slide8 = add_slide_with_header("Orchestration & Deploying the System", ACCENT_TEAL)

    add_card(slide8, Inches(0.5), top_pos, col_w, col_h)
    add_card_text(
        slide8, Inches(0.5), top_pos, col_w, col_h,
        "Database Startup & Initialization",
        [
            "Step 1: Start MySQL Service",
            "   Run .\\run-db.ps1 in the project root.",
            "   Initializes insecure root database under db-data directory and starts local MySQL server on port 3306.",
            "Step 2: Seed Schema & Mock Data",
            "   Navigate to server directory and run npm run seed.",
            "   Imports schema.sql table structures and runs seed.js to inject sample users, courses, and transactions."
        ],
        title_color=ACCENT_BLUE
    )

    add_card(slide8, Inches(6.933), top_pos, col_w, col_h)
    add_card_text(
        slide8, Inches(6.933), top_pos, col_w, col_h,
        "Unified Application Launch",
        [
            "Step 3: Run the Ecosystem",
            "   Execute .\\start-project.ps1 in the project root.",
            "   Verifies database connection, starts backend Express server on port 5000, and spins up frontend React/Vite development server on port 5173.",
            "Github & Development Ready",
            "   Equipped with structured .gitignore, sample environment variables (.env), and isolated data storage folders."
        ],
        title_color=ACCENT_TEAL
    )

    # Save presentation
    filename = "College_ERP_Dashboard_Presentation.pptx"
    prs.save(filename)
    print(f"Presentation saved as {filename}")

if __name__ == "__main__":
    create_presentation()
