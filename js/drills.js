/* ============================================================
   drills.js  –  60 Goalkeeping Drills for Camogie & Hurling
   ============================================================ */

window.DRILLS = [

  // ═══════════════════════════════════════════════════════════
  //  CATEGORY 1 — SHOT STOPPING
  // ═══════════════════════════════════════════════════════════

  {
    id: 'ss-01', category: 'Shot Stopping', categoryIcon: '🧤',
    sport: 'Both', ageGroup: 'Senior', difficulty: 'Standard',
    title: 'The Cone Gate Save',
    subtitle: 'Directional footwork and explosive diving',
    duration: '20 mins', players: '2–4', space: 'Goal Area',
    objective: [
      { icon: '🧤', text: 'Drive off the correct foot when diving to either side.' },
      { icon: '👀', text: 'Read the shooter\'s body shape before the ball is struck.' },
      { icon: '💪', text: 'Maintain strong wrist and hand position through contact.' }
    ],
    equipment: ['Full-size goal', '6 cones', '10+ sliotars', 'Hurls for shooters'],
    phases: [
      { text: '<strong>Warm-up (5 min):</strong> GK moves laterally between two cones set 1.5m apart, touching each cone then resetting to the centre. Repeat 3×30 sec bursts.' },
      { text: '<strong>Gate Saves (8 min):</strong> Place 3 pairs of cones across the goal line, each pair 60 cm wide — low, mid, high. Shooter calls a gate number (1–3) just before striking. GK must dive/move to save through that gate.' },
      { text: '<strong>No-Call Drill (5 min):</strong> Shooter does NOT call a gate — GK must read body shape and commit. Shooter and GK swap every 3 shots.' },
      { text: '<strong>Conditioned Game (2 min):</strong> 3 shots from a server; GK earns 1 point per save. Target: 2 from 3.' }
    ],
    coachingCues: ['"Drive off the back foot!"', '"Big hands — catch it clean!"', '"Stay on your feet as long as possible!"', '"Reset fast — next shot is coming!"'],
    progressions: [
      { level: 'Easier', text: 'Shooter strikes from 20m; allows GK more reaction time.' },
      { level: 'Standard', text: 'Shooter from 14m; mixed shot heights.' },
      { level: 'Harder', text: 'Two shooters alternate; GK must reset between every shot.' }
    ],
    safety: 'Ensure the ground in front of the goal is clear of stones or debris before diving begins. Use soft ground or a gym mat for indoor sessions. GK should complete a dynamic warm-up before any diving work.',
    successCriteria: [
      'GK drives off the correct foot — not just falling sideways.',
      'Ball is caught or pushed wide — not allowed to roll under the body.',
      'GK is back on feet and in set position within 2 seconds of a save.',
      'Eye contact on the ball maintained throughout the shot.'
    ],
    diagram: { gk: {x:50,y:12}, defenders: [], attackers: [{x:50,y:70,label:'S'}], cones: [{x:25,y:18},{x:50,y:18},{x:75,y:18}] }
  },

  {
    id: 'ss-02', category: 'Shot Stopping', categoryIcon: '🧤',
    sport: 'Both', ageGroup: 'U16', difficulty: 'Easier',
    title: 'Tennis Ball Reaction Save',
    subtitle: 'Lightning reflex training with small balls',
    duration: '15 mins', players: '2', space: 'Goal Mouth',
    objective: [
      { icon: '⚡', text: 'Improve reaction speed to unexpected shot directions.' },
      { icon: '🖐️', text: 'Develop independent hand reaction — left and right separately.' },
      { icon: '🎯', text: 'Train eyes to track fast, small projectiles.' }
    ],
    equipment: ['Portable goal or wall', '10 tennis balls', 'Bibs'],
    phases: [
      { text: '<strong>Wall Drops (4 min):</strong> GK faces away from a wall. Coach throws a tennis ball at the wall — GK turns and tries to catch the rebound before the second bounce.' },
      { text: '<strong>Dual-Hand Shots (6 min):</strong> Coach stands 5m from GK and throws two tennis balls in quick succession — one to each side. GK saves with one hand per ball. 10 reps, swap sides.' },
      { text: '<strong>Overload Reaction (5 min):</strong> GK in goal. Coach throws 3 tennis balls from 7m in rapid sequence (left, right, high). GK must save all 3 within 4 seconds.' }
    ],
    coachingCues: ['"Watch the hand, not the ball!"', '"Soft hands — let it stick!"', '"Eyes open all the way through!"', '"Quick reset — ball is coming again!"'],
    progressions: [
      { level: 'Easier', text: 'Use a soft foam ball instead of tennis ball.' },
      { level: 'Standard', text: 'Tennis ball from 5–7m.' },
      { level: 'Harder', text: 'Blindfold GK for 1 second, then remove — shot arrives immediately.' }
    ],
    safety: 'Keep session distance at least 5m to avoid facial impact at close range. If GK wears a helmet, the visor must be down. No overarm throws — underarm only.',
    successCriteria: [
      'GK reacts within 0.5 seconds of the ball leaving the thrower\'s hand.',
      'Both hands move independently without the weaker hand lagging.',
      'Eyes do not close at the moment of contact.'
    ],
    diagram: { gk: {x:50,y:12}, defenders: [], attackers: [{x:50,y:60,label:'C'}], cones: [] }
  },

  {
    id: 'ss-03', category: 'Shot Stopping', categoryIcon: '🧤',
    sport: 'Both', ageGroup: 'Senior', difficulty: 'Harder',
    title: 'The Penalty War',
    subtitle: 'Pressure penalty-saving with correct dive mechanics',
    duration: '25 mins', players: '4–8', space: 'Goal Area',
    objective: [
      { icon: '🧤', text: 'Learn to hold the set position and delay the dive as long as possible.' },
      { icon: '🧠', text: 'Read cues — plant foot angle, run-up speed, shoulder drop.' },
      { icon: '💬', text: 'Use psychological composure and presence to unsettle the striker.' }
    ],
    equipment: ['Full-size goal', '20+ sliotars', 'Bibs', 'Cone to mark penalty spot'],
    phases: [
      { text: '<strong>Technique Talk (3 min):</strong> Coach demonstrates the set position, the "stay and wait" principle, and hip drive for diving.' },
      { text: '<strong>One-Direction Rounds (8 min):</strong> GK knows which side the shot is going — trains the correct dive mechanics without the decision load. 5 left, 5 right.' },
      { text: '<strong>Read & Decide (10 min):</strong> Shooter has a secret card (L or R) — GK must read and commit. After each save, coach gives verbal feedback on trigger cue missed or spotted.' },
      { text: '<strong>Penalty War (4 min):</strong> 4 players each take 3 penalties. GK scores 2 for a save. Striker scores 1 for a goal. Leaderboard tracked by coach.' }
    ],
    coachingCues: ['"Stay BIG — don\'t dive early!"', '"Read the plant foot!"', '"Own your goal line — this is YOUR space!"', '"One step forward — cut the angle!"'],
    progressions: [
      { level: 'Easier', text: 'GK told which side — focused on technique only.' },
      { level: 'Standard', text: 'GK reads the cue — no prior information.' },
      { level: 'Harder', text: 'Striker can change direction in run-up; GK must hold position even longer.' }
    ],
    safety: 'Players taking penalties must strike from a standing position — no running jump strikes allowed during technique drill. GK gloves or hand protection recommended.',
    successCriteria: [
      'GK does not dive before the ball is struck.',
      'Hip drives across before shoulders — not a sideways collapse.',
      'GK makes saves to both sides with equal confidence.',
      'Body language stays composed — no telegraphing nerves.'
    ],
    diagram: { gk: {x:50,y:12}, defenders: [], attackers: [{x:50,y:72,label:'P'}], cones: [{x:50,y:72}] }
  },

  {
    id: 'ss-04', category: 'Shot Stopping', categoryIcon: '🧤',
    sport: 'Camogie', ageGroup: 'U16', difficulty: 'Standard',
    title: 'Wide-Angle Challenge',
    subtitle: 'Saving shots struck from acute angles',
    duration: '20 mins', players: '3–5', space: 'Goal + 45° Wide',
    objective: [
      { icon: '📐', text: 'Position correctly to cut off the near post before the shot.' },
      { icon: '🧤', text: 'Make saves from wide angles — protect near post first.' },
      { icon: '👀', text: 'Track the ball from the wing all the way to contact.' }
    ],
    equipment: ['Full-size goal', '2 cones to mark wide zones', '12 sliotars'],
    phases: [
      { text: '<strong>Angle Walk (4 min):</strong> Coach places GK at various wide-angle positions. GK practises shuffling to the near post and setting. No ball — just positioning.' },
      { text: '<strong>Near Post Shots (8 min):</strong> Shooter strikes from a 45° wide position. GK must get to the near post and save or force the ball wide. 5 shots each side.' },
      { text: '<strong>Cross + Shot (8 min):</strong> Ball is played from one side to a central attacker who lays it off to a late runner coming from the other wide position. GK must readjust angle quickly before the shot.' }
    ],
    coachingCues: ['"Near post FIRST — always!"', '"Don\'t be caught in no man\'s land!"', '"Shuffle, don\'t cross your feet!"', '"Force it wide — not back across!"'],
    progressions: [
      { level: 'Easier', text: 'Shooter passes before shooting; GK has more time to set.' },
      { level: 'Standard', text: 'Shooter shoots directly from wide position.' },
      { level: 'Harder', text: 'Add a dummy run across goal to distract GK before the shot.' }
    ],
    safety: 'Wide-angle shots increase near-post exposure — ensure GK has hand and head protection. No overhead or smash shots at close range.',
    successCriteria: [
      'GK always has the near post covered before the shot.',
      'GK does not concede near-post goals.',
      'Recovery to central position is made within 2 seconds if ball is played inward.'
    ],
    diagram: { gk: {x:50,y:12}, defenders: [], attackers: [{x:15,y:60,label:'S'},{x:75,y:60,label:'S'}], cones: [] }
  },

  {
    id: 'ss-05', category: 'Shot Stopping', categoryIcon: '🧤',
    sport: 'Both', ageGroup: 'Senior', difficulty: 'Standard',
    title: 'Rebound Wall Drill',
    subtitle: 'Unpredictable rebound handling',
    duration: '15 mins', players: '2–3', space: 'Training Wall',
    objective: [
      { icon: '⚡', text: 'Train explosive reactions to unpredictable rebounds.' },
      { icon: '🧤', text: 'Secure second saves quickly and with safe hands.' },
      { icon: '🔁', text: 'Develop mental alertness — GK must always expect a second shot.' }
    ],
    equipment: ['Solid training wall (or rebound board)', '10 sliotars', 'Helmets'],
    phases: [
      { text: '<strong>Solo Rebounds (5 min):</strong> GK strikes the sliotar against the wall from 4m and must catch or bat away the rebound. Progress from slow to hard strikes over 5 min.' },
      { text: '<strong>Partner Rebounds (6 min):</strong> Partner strikes hard at wall from 6m — GK stands 3m from wall and reacts to rebound. Direction is unknown. 10 reps per person.' },
      { text: '<strong>Rapid Rebound (4 min):</strong> Partner fires 3 balls in 8 seconds. GK must clear each rebound before the next arrives. No stopping allowed between reps.' }
    ],
    coachingCues: ['"Stay low — rebounds come low!"', '"Don\'t let it die at your feet — attack it!"', '"Punching is fine — but make it count!"', '"Reset height instantly after every touch!"'],
    progressions: [
      { level: 'Easier', text: 'Reduce strike pace — partner taps the ball gently.' },
      { level: 'Standard', text: 'Full pace strikes; GK 3m from wall.' },
      { level: 'Harder', text: 'GK has eyes closed until partner shouts "Go!" — ball already in motion.' }
    ],
    safety: 'Helmets and gloves essential. Minimum 3m between GK and wall during partner drill. No players behind the GK during rebound work.',
    successCriteria: [
      'GK deals cleanly with 7 out of 10 rebounds (no fumbles to ground).',
      'GK does not turn away from the ball — faces the rebound every time.',
      'Second saves are made as confidently as first saves.'
    ],
    diagram: { gk: {x:50,y:50}, defenders: [], attackers: [], cones: [{x:50,y:15}] }
  },

  {
    id: 'ss-06', category: 'Shot Stopping', categoryIcon: '🧤',
    sport: 'Both', ageGroup: 'U14', difficulty: 'Easier',
    title: 'Crossbar Tipping',
    subtitle: 'Handling aerial shots and tipping over the bar',
    duration: '15 mins', players: '2–4', space: 'Goal Area',
    objective: [
      { icon: '🙌', text: 'Learn the correct technique for tipping a ball over the crossbar.' },
      { icon: '🦘', text: 'Develop vertical jump and extension at full stretch.' },
      { icon: '👀', text: 'Assess height of shot early and commit to tipping vs. catching.' }
    ],
    equipment: ['Full-size goal', '8 sliotars', 'Server with hurl or hand-throw capability'],
    phases: [
      { text: '<strong>Jump Training (3 min):</strong> GK jumps and touches the crossbar 10 times — both hands, then each hand alternately. Focus on two-footed take-off and landing.' },
      { text: '<strong>Directed Tips (7 min):</strong> Server lobs ball towards the top corners. GK must decide to catch or tip. If tipping, use fingertips to divert over bar — not palms.' },
      { text: '<strong>Under-Pressure Tips (5 min):</strong> A forward runs in making noise/movement. GK must still focus on the ball and make the correct tip despite the distraction.' }
    ],
    coachingCues: ['"Fingertips — not fists!"', '"Eyes on the ball, not the forward!"', '"Two-footed jump — don\'t just reach!"', '"Shout \'Keeper!\' before you go for it!"'],
    progressions: [
      { level: 'Easier', text: 'Use a lighter ball (size 3) so GK can practice tips without strain.' },
      { level: 'Standard', text: 'Full sliotar, lobs from 12m.' },
      { level: 'Harder', text: 'Ball delivered at speed — GK must react and tip in under 1.5 seconds.' }
    ],
    safety: 'Ensure GK lands safely — both feet together, knees slightly bent. Never allow a GK to leap for a ball with a chasing forward directly underneath. Landing zone must be free of other players.',
    successCriteria: [
      'GK tips the ball cleanly over bar — not blocking it back into play.',
      'Two-footed take-off and controlled landing every time.',
      'GK calls "Keeper!" before going for every aerial ball.'
    ],
    diagram: { gk: {x:50,y:12}, defenders: [], attackers: [{x:50,y:55,label:'S'}], cones: [] }
  },

  {
    id: 'ss-07', category: 'Shot Stopping', categoryIcon: '🧤',
    sport: 'Hurling', ageGroup: 'Senior', difficulty: 'Harder',
    title: 'Rapid Fire Sequence',
    subtitle: 'Multi-shot stamina and reset speed',
    duration: '20 mins', players: '5–6', space: 'Goal Area',
    objective: [
      { icon: '🔥', text: 'Maintain technical standards when fatigued.' },
      { icon: '⚡', text: 'Develop explosive reset speed between saves.' },
      { icon: '🧠', text: 'Build mental resilience — cope with conceding and refocus.' }
    ],
    equipment: ['Full-size goal', '20+ sliotars', '3–4 shooters', 'Bibs'],
    phases: [
      { text: '<strong>Warm-up (4 min):</strong> GK does short sprints (5m), lateral bounds, and hand-drops to prime reaction systems.' },
      { text: '<strong>3-Shot Bursts (10 min):</strong> 3 players spaced across the 21m line. They shoot one after another with ~3 seconds between. GK resets to centre after each. Rotate shooters every 5 bursts.' },
      { text: '<strong>Pressure Series (6 min):</strong> Shooters reduce gap to 2 seconds. GK cannot be set — must save off balance. Emphasis is on making contact with every ball regardless of body position.' }
    ],
    coachingCues: ['"Centre — quick!"', '"Every ball matters — don\'t switch off after one!"', '"Body behind the ball — don\'t just use hands!"', '"You are the last line — make it count!"'],
    progressions: [
      { level: 'Easier', text: '4-second gap between shots. Two shooters only.' },
      { level: 'Standard', text: '3-second gap. Three shooters.' },
      { level: 'Harder', text: '2-second gap. Four shooters. GK must also shout target zone of each save after making it.' }
    ],
    safety: 'All shooters must wait for the "Go" signal from the coach before shooting. GK wears helmet at all times. Area behind goal must be clear — balls exiting quickly.',
    successCriteria: [
      'GK makes meaningful contact with every shot — no giving up.',
      'Reset to centre position happens in under 1.5 seconds.',
      'Saves maintained at over 60% across the rapid-fire sequence.'
    ],
    diagram: { gk: {x:50,y:12}, defenders: [], attackers: [{x:20,y:55,label:'S'},{x:50,y:55,label:'S'},{x:80,y:55,label:'S'}], cones: [] }
  },

  {
    id: 'ss-08', category: 'Shot Stopping', categoryIcon: '🧤',
    sport: 'Both', ageGroup: 'U16', difficulty: 'Standard',
    title: 'Ground Ball Smother',
    subtitle: 'Low shot and ground-ball smother technique',
    duration: '18 mins', players: '2–4', space: 'Goal Area',
    objective: [
      { icon: '🙌', text: 'Learn the correct body-drop technique for smothering ground shots.' },
      { icon: '🛡️', text: 'Use the body as a barrier — ball must not squirm underneath.' },
      { icon: '⚡', text: 'React quickly to low driven shots at pace.' }
    ],
    equipment: ['Goal or small target zone', '12 sliotars', 'Training cones'],
    phases: [
      { text: '<strong>Technique Demonstration (4 min):</strong> Coach shows the body-drop smother: lead knee down, arms spread wide, chest over ball, head up. GK practises in slow motion without a ball.' },
      { text: '<strong>Rolled Ball Smothers (7 min):</strong> Partner rolls ball along the ground at varying speeds. GK collapses to block. Focus on covering the widest area possible without diving past the ball.' },
      { text: '<strong>Driven Low Shots (7 min):</strong> Shots struck low and hard from 14m. GK must decide: dive wide or smother centrally. Emphasis on blocking angle before diving.' }
    ],
    coachingCues: ['"Get your body BEHIND the ball!"', '"Wide base — spread the body!"', '"Lead knee first — don\'t dive headfirst!"', '"Secure it — don\'t let it pop out!"'],
    progressions: [
      { level: 'Easier', text: 'Ball rolled slowly — GK sets before ball arrives.' },
      { level: 'Standard', text: 'Driven ball from 14m; direction unknown.' },
      { level: 'Harder', text: 'Deflection off a cone before reaching GK — requires late adjustment.' }
    ],
    safety: 'Practice on soft ground or gym mats during technique phase. No striking directly at the GK\'s head when shot is at ground level. GK must never dive headfirst at a moving sliotar.',
    successCriteria: [
      'Body forms a complete barrier — ball cannot pass through legs or under body.',
      'Head remains up even when body is on ground.',
      'GK smothers 7/10 low shots without fumble.'
    ],
    diagram: { gk: {x:50,y:12}, defenders: [], attackers: [{x:35,y:60,label:'S'},{x:65,y:60,label:'S'}], cones: [] }
  },

  {
    id: 'ss-09', category: 'Shot Stopping', categoryIcon: '🧤',
    sport: 'Camogie', ageGroup: 'Senior', difficulty: 'Standard',
    title: 'Blindside Awareness',
    subtitle: 'Saving shots obscured by screening players',
    duration: '20 mins', players: '4–6', space: 'Goal Area',
    objective: [
      { icon: '👀', text: 'Maintain a sightline to the ball even when players block the view.' },
      { icon: '🦶', text: 'Use footwork to move and find the ball through a crowd.' },
      { icon: '🧠', text: 'Learn to anticipate shot direction when ball is hidden.' }
    ],
    equipment: ['Full-size goal', '10 sliotars', '2 neutral "screeners"'],
    phases: [
      { text: '<strong>Movement Check (4 min):</strong> Two neutral players stand between GK and shooter and move randomly. GK practises shuffling left/right to find a clear sightline — no ball yet.' },
      { text: '<strong>Screened Shots (10 min):</strong> Shooter fires from 21m with two screeners in place. GK must see the ball before/during flight. Screeners allowed to deflect (not catch) the ball — GK adjusts in real time.' },
      { text: '<strong>Last-Second Reveal (6 min):</strong> Screeners part 1 second before the shot is struck. GK must pick up the ball instantly and make the save.' }
    ],
    coachingCues: ['"Move to see the ball — don\'t wait!"', '"Head on a swivel — scan the whole picture!"', '"Anticipate where the shot comes from — watch the hips!"', '"Step around the screen — don\'t stand still!"'],
    progressions: [
      { level: 'Easier', text: 'Screeners stand still — GK only has to move once to find line.' },
      { level: 'Standard', text: 'Screeners shuffle randomly.' },
      { level: 'Harder', text: 'Screener deliberately steps in front of shot line just before contact.' }
    ],
    safety: 'Screeners must not make physical contact with the GK. No full-power shots when screeners are directly in the line of fire.',
    successCriteria: [
      'GK successfully finds a clear sightline before every shot.',
      'Saves not significantly worse than non-screened drills.',
      'GK adjusts position proactively — not reactively.'
    ],
    diagram: { gk: {x:50,y:12}, defenders: [{x:45,y:35,label:'N'},{x:55,y:35,label:'N'}], attackers: [{x:50,y:65,label:'S'}], cones: [] }
  },

  {
    id: 'ss-10', category: 'Shot Stopping', categoryIcon: '🧤',
    sport: 'Both', ageGroup: 'U14', difficulty: 'Standard',
    title: 'The Colour Save',
    subtitle: 'Decision-making saves using coloured targets',
    duration: '15 mins', players: '2–3', space: 'Goal Area',
    objective: [
      { icon: '🎨', text: 'Link movement decisions to colour cues for faster decision making.' },
      { icon: '⚡', text: 'Train rapid left/right choice before ball is struck.' },
      { icon: '🧠', text: 'Introduce cognitive load alongside physical technique.' }
    ],
    equipment: ['Goal', '4 coloured cones (2 red, 2 blue)', '10 sliotars', 'Bibs'],
    phases: [
      { text: '<strong>Setup (2 min):</strong> Red cones at left and right post base. Blue cones 2m inside each post. "Red" = dive to post. "Blue" = stay central and catch.' },
      { text: '<strong>Colour Call (8 min):</strong> Coach calls a colour 1 second before the shot is struck. GK must make the corresponding movement. Shooter strikes toward the called zone.' },
      { text: '<strong>Colour Swap (5 min):</strong> Swap the colour meanings without warning. GK must adapt quickly. Tests cognitive flexibility alongside movement.' }
    ],
    coachingCues: ['"Listen first, move second!"', '"Don\'t guess — wait for the cue!"', '"Brain first, body second — then COMMIT!"', '"Stay relaxed — tension slows your brain!"'],
    progressions: [
      { level: 'Easier', text: 'Two colours only; consistent meanings throughout.' },
      { level: 'Standard', text: 'Introduce a third colour (yellow = no action — dummy).' },
      { level: 'Harder', text: 'Coach calls number + colour combination (e.g., "2 red" = dive right twice in 4 seconds).' }
    ],
    safety: 'Appropriate for all ages. Ensure drill pace allows GK to succeed — this is a learning drill, not punishment.',
    successCriteria: [
      'GK responds correctly to colour within 1 second of call.',
      'Technical quality of save is not sacrificed for speed.',
      'GK successfully adapts when meanings are swapped.'
    ],
    diagram: { gk: {x:50,y:12}, defenders: [], attackers: [{x:50,y:60,label:'S'}], cones: [{x:30,y:18},{x:70,y:18}] }
  },

  // ═══════════════════════════════════════════════════════════
  //  CATEGORY 2 — PUCKOUT & DISTRIBUTION
  // ═══════════════════════════════════════════════════════════

  {
    id: 'pd-01', category: 'Puckout & Distribution', categoryIcon: '🏑',
    sport: 'Both', ageGroup: 'Senior', difficulty: 'Standard',
    title: 'Short Puckout Accuracy',
    subtitle: 'Accurate distribution to defenders under light pressure',
    duration: '20 mins', players: '4–6', space: 'Goal Area + 30m',
    objective: [
      { icon: '🎯', text: 'Deliver an accurate short puckout to a moving defender.' },
      { icon: '📢', text: 'Read the pressure and choose the right outlet quickly.' },
      { icon: '🏑', text: 'Vary puckout trajectory — flat, lofted, and hand-pass options.' }
    ],
    equipment: ['Full-size goal', '12 sliotars', '3 defenders', '1 pressing forward'],
    phases: [
      { text: '<strong>No-Pressure Short (5 min):</strong> GK takes a puckout to a stationary defender at 20m. Focus on consistency of contact and trajectory. 15 reps each direction.' },
      { text: '<strong>Moving Target (8 min):</strong> Defender runs a short square route — GK must lead them with the pass, not aim at where they are. "Lead the runner!"' },
      { text: '<strong>Pressed Puckout (7 min):</strong> Add one forward who presses the nearest defender. GK must choose: go short to the free defender, or play long to space. Decision made in under 3 seconds of the ball crossing the line.' }
    ],
    coachingCues: ['"Pick your target before you set the ball!"', '"Lead the runner — not where they are!"', '"Short only if it\'s on — if not, go long!"', '"Quick hands after the save — restart fast!"'],
    progressions: [
      { level: 'Easier', text: 'No forward pressing — GK chooses from two stationary targets.' },
      { level: 'Standard', text: 'One forward pressuring nearest defender.' },
      { level: 'Harder', text: 'Two forwards pressing — GK must switch to the unexpected target.' }
    ],
    safety: 'Ensure GK and pressing forward do not collide near the end line. Set a minimum distance of 5m between forward and GK.',
    successCriteria: [
      'Short puckout reaches target with pace — not a looped ball the forward can intercept.',
      'GK selects correctly between short and long option 7/10 times.',
      'Restart is completed within 5 seconds of the ball going dead.'
    ],
    diagram: { gk: {x:50,y:12}, defenders: [{x:25,y:45,label:'D'},{x:75,y:45,label:'D'}], attackers: [{x:30,y:50,label:'F'}], cones: [] }
  },

  {
    id: 'pd-02', category: 'Puckout & Distribution', categoryIcon: '🏑',
    sport: 'Both', ageGroup: 'Senior', difficulty: 'Harder',
    title: 'Long-Range Zone Puckout',
    subtitle: 'Hitting targeted zones at maximum distance',
    duration: '25 mins', players: '3–5', space: 'Full Pitch Half',
    objective: [
      { icon: '📐', text: 'Hit defined target zones (left wing, right wing, centre) with accuracy.' },
      { icon: '💪', text: 'Maintain distance and directional control under physical effort.' },
      { icon: '🧠', text: 'Decide zone based on a reading of the defence before striking.' }
    ],
    equipment: ['Full-size goal', '20+ sliotars', '6 cones to mark 3 target zones at 50–65m'],
    phases: [
      { text: '<strong>Zone Familiarisation (4 min):</strong> GK strikes 3 puckouts to each of the 3 zones — coach gives feedback on landing accuracy. No pressure.' },
      { text: '<strong>Called Zone (10 min):</strong> Coach calls zone name 2 seconds before GK pucks. GK must commit to that zone. Score: 2 pts for landing in zone, 1 pt for within 5m, 0 for outside.' },
      { text: '<strong>Visual Read (11 min):</strong> Defenders and forwards set up in zones. GK must identify the free zone and puck there — no call from coach. Simulates match-reading.' }
    ],
    coachingCues: ['"See it, decide, COMMIT — no hesitation!"', '"Follow through toward the target zone!"', '"Read the press — go where they\'re not!"', '"Trust the striking technique — don\'t steer!"'],
    progressions: [
      { level: 'Easier', text: 'Zones are large (10m wide). GK stays close to goal.' },
      { level: 'Standard', text: 'Zones 6m wide at 55–65m distance.' },
      { level: 'Harder', text: 'Zones move based on defender positioning — GK must read new zone every rep.' }
    ],
    safety: 'All players in landing zones must wear helmets and be alert. No player should stand within 5m of a landing zone without watching for incoming ball.',
    successCriteria: [
      'GK lands ball in correct zone in 6/10 attempts.',
      'Ball has sufficient distance to reach the 50m mark consistently.',
      'GK identifies the correct free zone in visual reading drill 7/10 times.'
    ],
    diagram: { gk: {x:50,y:12}, defenders: [{x:20,y:65,label:'T'},{x:50,y:65,label:'T'},{x:80,y:65,label:'T'}], attackers: [], cones: [] }
  },

  {
    id: 'pd-03', category: 'Puckout & Distribution', categoryIcon: '🏑',
    sport: 'Both', ageGroup: 'U16', difficulty: 'Standard',
    title: 'The Quick Puckout',
    subtitle: 'Fast restarts to exploit an unorganised defence',
    duration: '15 mins', players: '4–6', space: 'Goal + Midfield',
    objective: [
      { icon: '⚡', text: 'Take a puckout within 3 seconds of ball going dead to exploit a transitional moment.' },
      { icon: '🧠', text: 'Recognise when a quick puckout is "on" versus when to wait for organisation.' },
      { icon: '📢', text: 'Communicate the quick puckout intention to team-mates before taking it.' }
    ],
    equipment: ['Goal', '12 sliotars', '2 target players at midfield', '1 defensive forward'],
    phases: [
      { text: '<strong>Signal System (3 min):</strong> Coach teaches the "quick" signal — GK points to target player and shouts "Go!" Both need to know the system before it can work in a match.' },
      { text: '<strong>Fast Restart Practice (7 min):</strong> Coach rolls ball behind the goal — GK retrieves, sets, and pucks out to a running target within 4 seconds. The target player starts running the moment the ball crosses the end line.' },
      { text: '<strong>Opposed Quick Puckout (5 min):</strong> Add a forward who chases the GK restart. GK must execute within 3 seconds or forward blocks the route. Tests urgency and accuracy under pressure.' }
    ],
    coachingCues: ['"If it\'s on — go! Don\'t overthink!"', '"Signal before you go — team needs to move!"', '"Ball in hand — clock is ticking!"', '"Quick puckout only if the target is free!"'],
    progressions: [
      { level: 'Easier', text: 'No forward pressing — timed against a stopwatch only.' },
      { level: 'Standard', text: 'One pressing forward, 4-second window.' },
      { level: 'Harder', text: 'Two possible targets — GK must choose the correct one in under 3 seconds while forward presses.' }
    ],
    safety: 'Forward must not make physical contact with GK during the quick puckout. Minimum 3m exclusion zone around GK.',
    successCriteria: [
      'GK successfully restarts within 4 seconds in 8/10 attempts.',
      'Target is moving before ball arrives.',
      'GK correctly identifies when quick puckout is not on and waits 3/3 times coach signals "hold".'
    ],
    diagram: { gk: {x:50,y:12}, defenders: [{x:35,y:55,label:'T'},{x:65,y:55,label:'T'}], attackers: [{x:50,y:35,label:'F'}], cones: [] }
  },

  {
    id: 'pd-04', category: 'Puckout & Distribution', categoryIcon: '🏑',
    sport: 'Hurling', ageGroup: 'Senior', difficulty: 'Harder',
    title: 'The Switch Puckout',
    subtitle: 'Changing direction of puckout at the last moment',
    duration: '20 mins', players: '5–8', space: 'Full Pitch Half',
    objective: [
      { icon: '🔀', text: 'Deceive a pressing defence by switching the puckout direction after initially signalling one side.' },
      { icon: '🏑', text: 'Execute both a natural and "unnatural" side puckout with consistency.' },
      { icon: '📢', text: 'Use non-verbal signals to alert the intended receiver before the switch.' }
    ],
    equipment: ['Goal', '20+ sliotars', '3 target players', '2 defending forwards'],
    phases: [
      { text: '<strong>Setup Reading (4 min):</strong> Coach names three puckout targets (Left, Centre, Right). GK identifies which side is being "over-defended" and calls the switch zone.' },
      { text: '<strong>Fake Side + Switch (10 min):</strong> GK takes an exaggerated step toward one side (faking direction) then pucks to the opposite side. Target players know the code. Practice both natural and unnatural directions.' },
      { text: '<strong>Live Switch Scenario (6 min):</strong> Two forwards cover two zones. GK must switch to the uncovered zone in real time. GK gets 20 seconds after the last score to set and execute.' }
    ],
    coachingCues: ['"Commit to the fake — sell it!"', '"Eyes one way, ball goes the other!"', '"Your target needs to know — signal!"', '"Don\'t be predictable — mix it up!"'],
    progressions: [
      { level: 'Easier', text: 'No forwards — GK practices the footwork of the fake in isolation.' },
      { level: 'Standard', text: 'Two forwards; one zone free.' },
      { level: 'Harder', text: 'Forwards react to GK body language and adjust in real time — GK must commit later in the motion to deceive them.' }
    ],
    safety: 'Ensure all players in receiving zones are alert and wearing helmets. Ball comes at distance — still significant velocity.',
    successCriteria: [
      'GK successfully disguises intended direction in 6/10 reps (observers cannot predict switch).',
      'Ball reaches intended target zone with accuracy.',
      'Signal to target is clear and timely — not too early (gives away switch) and not too late.'
    ],
    diagram: { gk: {x:50,y:12}, defenders: [{x:20,y:60,label:'T'},{x:80,y:60,label:'T'}], attackers: [{x:25,y:55,label:'F'},{x:75,y:55,label:'F'}], cones: [] }
  },

  {
    id: 'pd-05', category: 'Puckout & Distribution', categoryIcon: '🏑',
    sport: 'Camogie', ageGroup: 'U14', difficulty: 'Easier',
    title: 'Target Zone Accuracy Challenge',
    subtitle: 'Grid-based puckout accuracy for younger GKs',
    duration: '15 mins', players: '2–3', space: '30m Zone',
    objective: [
      { icon: '🎯', text: 'Develop repeatable puckout mechanics using a clear target grid.' },
      { icon: '💪', text: 'Build confidence in striking the sliotar consistently under no pressure.' },
      { icon: '📏', text: 'Understand the importance of accurate distribution to team-mates.' }
    ],
    equipment: ['Goal', '12 sliotars', '6 cones in a 3×2 grid at 25–35m'],
    phases: [
      { text: '<strong>Grid Introduction (3 min):</strong> Coach places 6 cones in a grid of 3 columns × 2 rows at 25–35m from goal. Each square is 4m × 4m and numbered 1–6.' },
      { text: '<strong>Called Target (8 min):</strong> Coach calls a number — GK must puck to land ball in that square. 15 reps. Coach marks score on whiteboard.' },
      { text: '<strong>Self-Directed (4 min):</strong> GK picks their own target each rep and aims. Focus is on commitment to the target and following through toward it.' }
    ],
    coachingCues: ['"Pick your target, look at it, then swing!"', '"High arc gets more distance — flatten the arc for accuracy close."', '"Follow through toward where you want the ball to go!"', '"Slow backswing, fast strike!"'],
    progressions: [
      { level: 'Easier', text: 'Reduce distance to 20m; larger grid squares (5m wide).' },
      { level: 'Standard', text: 'Grid at 30m; standard square sizes.' },
      { level: 'Harder', text: 'GK must hit 3 different squares in sequence without missing — if they miss one, restart sequence.' }
    ],
    safety: 'All players near the landing grid must be alert. No standing in a grid square when the GK is about to strike.',
    successCriteria: [
      'GK lands ball in correct square in 8/15 attempts.',
      'Contact with ball is clean — no mishits or top edges.',
      'GK verbally commits to a target before each strike.'
    ],
    diagram: { gk: {x:50,y:12}, defenders: [], attackers: [], cones: [{x:30,y:55},{x:50,y:55},{x:70,y:55},{x:30,y:70},{x:50,y:70},{x:70,y:70}] }
  },

  {
    id: 'pd-06', category: 'Puckout & Distribution', categoryIcon: '🏑',
    sport: 'Both', ageGroup: 'Senior', difficulty: 'Standard',
    title: 'Puckout Under Fatigue',
    subtitle: 'Maintaining accuracy after high-intensity sprints',
    duration: '20 mins', players: '3–5', space: 'Goal + 40m',
    objective: [
      { icon: '💪', text: 'Maintain puckout accuracy when physically fatigued (late-game simulation).' },
      { icon: '🧠', text: 'Develop composure and breathing control before striking.' },
      { icon: '🎯', text: 'Execute a controlled restart regardless of heart rate or fatigue.' }
    ],
    equipment: ['Goal', '15 sliotars', 'Cones for sprint course', 'Timer'],
    phases: [
      { text: '<strong>Sprint Protocol (8 min):</strong> GK sprints 20m forward and back, 3 times (approx. 30 seconds of effort). Immediately walks to goal and takes a puckout. Rest 60 seconds. Repeat 4 sets.' },
      { text: '<strong>Post-Sprint Reading (8 min):</strong> After each sprint, coach points to a target player in one of 3 zones — GK must read and puck there while breathing heavily.' },
      { text: '<strong>Recovery Breathing (4 min):</strong> Between sets, coach teaches "box breathing" (4 sec in, 4 hold, 4 out, 4 hold) — used to reset before striking after heavy exertion.' }
    ],
    coachingCues: ['"Control the breath before you strike!"', '"Slow it down — 2 seconds of calm before the swing!"', '"Good players puck well when tired — great players are consistent."', '"You\'re doing this in the 70th minute — commit!"'],
    progressions: [
      { level: 'Easier', text: 'Light jog instead of sprint. Longer rest period.' },
      { level: 'Standard', text: 'Full sprint protocol as described.' },
      { level: 'Harder', text: 'Add a simulated save sequence before the puckout — GK sprints, makes 2 saves, then pucks out.' }
    ],
    safety: 'Monitor GK for signs of excessive fatigue. Ensure adequate hydration. Stop the drill if GK shows dizziness or nausea.',
    successCriteria: [
      'Puckout accuracy post-fatigue within 15% of fresh accuracy baseline.',
      'GK uses breathing technique before at least 3/4 of fatigued puckouts.',
      'No rushed or mistimed strikes — each puckout is deliberate.'
    ],
    diagram: { gk: {x:50,y:12}, defenders: [{x:25,y:55,label:'T'},{x:75,y:55,label:'T'}], attackers: [], cones: [] }
  },

  {
    id: 'pd-07', category: 'Puckout & Distribution', categoryIcon: '🏑',
    sport: 'Both', ageGroup: 'U16', difficulty: 'Standard',
    title: 'The Tactical Restart',
    subtitle: 'Reading the press and playing through or around it',
    duration: '22 mins', players: '6–10', space: 'Half Pitch',
    objective: [
      { icon: '🧠', text: 'Identify when the opposition is pressing the puckout versus dropping deep.' },
      { icon: '🔀', text: 'Decide between short restart, long ball, and switch in under 3 seconds.' },
      { icon: '📢', text: 'Communicate the correct puckout plan to team-mates before executing.' }
    ],
    equipment: ['Full-size goal', '20+ sliotars', '4 defensive targets', '3 pressing forwards'],
    phases: [
      { text: '<strong>Shape Recognition (4 min):</strong> Coach sets up "press" and "drop" formations with 3 forwards. GK must identify which it is from the end line and call it out. 10 reps without ball.' },
      { text: '<strong>Responding to Press (10 min):</strong> Three forwards apply a press. GK must find a free defender and distribute. If all pressed, must go long over the top.' },
      { text: '<strong>Responding to Drop (8 min):</strong> Forwards drop to deny the long ball. GK must identify this and go short quickly before the press resets. Time allowed: 5 seconds from signal.' }
    ],
    coachingCues: ['"What do you see? Call it!"', '"If they\'re pressing — go long. If they\'re dropping — go short early!"', '"Decision first, mechanics second!"', '"Talk to your defenders — they see more than you."'],
    progressions: [
      { level: 'Easier', text: 'Forwards hold positions — no movement. GK simply reads the static shape.' },
      { level: 'Standard', text: 'Forwards move reactively after GK indicates direction.' },
      { level: 'Harder', text: 'Forwards adapt in real time — continuously changing between press and drop during the 5-second window.' }
    ],
    safety: 'No tackling during this drill — forward pressure is from positioning only, not physical challenge.',
    successCriteria: [
      'GK correctly identifies press vs. drop in 8/10 reps.',
      'Correct distribution choice made 7/10 times.',
      'Communication is verbal and timely — called before the strike, not after.'
    ],
    diagram: { gk: {x:50,y:12}, defenders: [{x:20,y:45,label:'D'},{x:50,y:42,label:'D'},{x:80,y:45,label:'D'}], attackers: [{x:30,y:50,label:'F'},{x:50,y:55,label:'F'},{x:70,y:50,label:'F'}], cones: [] }
  },

  {
    id: 'pd-08', category: 'Puckout & Distribution', categoryIcon: '🏑',
    sport: 'Camogie', ageGroup: 'Senior', difficulty: 'Standard',
    title: 'Hand-Pass Outlet',
    subtitle: 'Short hand-passing sequences from the end line',
    duration: '15 mins', players: '3–5', space: 'Goal Area + 25m',
    objective: [
      { icon: '✋', text: 'Execute clean, weighted hand-passes to nearby defenders as an alternative to pucking out.' },
      { icon: '⚡', text: 'Combine with a quick movement sequence to create overload near the end line.' },
      { icon: '🧠', text: 'Know when a hand-pass is safer and more effective than a puckout.' }
    ],
    equipment: ['Goal', '10 sliotars', '3 defenders', '1 forward'],
    phases: [
      { text: '<strong>Solo Passing (4 min):</strong> GK hand-passes accurately to a stationary target at 8m, 12m, and 18m. 5 reps at each distance.' },
      { text: '<strong>Moving Outlet (7 min):</strong> Defender runs a curve from behind the goal — GK times the hand-pass to lead them as they emerge into space. No forward yet.' },
      { text: '<strong>Pressed Outlet (4 min):</strong> Add a forward who presses the nearest outlet. GK must choose which defender is free and hand-pass with precision to avoid turnover.' }
    ],
    coachingCues: ['"Use the hand-pass when pucking out is blocked!"', '"Lead the runner — not where they are now!"', '"Weight it right — too hard and they can\'t control, too soft and it\'s turnover."', '"Eyes up before the ball goes!"'],
    progressions: [
      { level: 'Easier', text: 'One stationary target at 10m. No pressure.' },
      { level: 'Standard', text: 'Two moving targets; one forward pressing.' },
      { level: 'Harder', text: 'Time limit of 3 seconds from ball dead — GK must identify, signal, and deliver within 3 seconds.' }
    ],
    safety: 'Ensure GK does not step over the end line when delivering hand-pass — practice staying within bounds.',
    successCriteria: [
      'Hand-passes are clean and accurate — receiver can control ball first-touch.',
      'GK uses hand-pass appropriately — not as a last resort.',
      'Outlet decision is made before the ball is in hand — not while holding it.'
    ],
    diagram: { gk: {x:50,y:12}, defenders: [{x:30,y:35,label:'D'},{x:70,y:35,label:'D'}], attackers: [{x:35,y:40,label:'F'}], cones: [] }
  },

  {
    id: 'pd-09', category: 'Puckout & Distribution', categoryIcon: '🏑',
    sport: 'Hurling', ageGroup: 'U14', difficulty: 'Easier',
    title: 'The Kickout Alternative',
    subtitle: 'Using a kick-style restart for short distribution',
    duration: '15 mins', players: '2–4', space: 'Goal Area',
    objective: [
      { icon: '🦶', text: 'Learn to use a kick (strike off the ground) as a short-distance restart option.' },
      { icon: '🎯', text: 'Develop accuracy of kicked ball to a stationary target at 15–25m.' },
      { icon: '🧠', text: 'Understand when a kicked restart is appropriate versus a puckout.' }
    ],
    equipment: ['Goal', '10 sliotars', '2 target defenders', 'Cones'],
    phases: [
      { text: '<strong>Drop Kick Mechanics (5 min):</strong> GK drops ball from hand and strikes with instep — does not have to use hurl for this restart. Coach demonstrates trajectory and weight.' },
      { text: '<strong>Accuracy to Target (7 min):</strong> Target stands at 20m. GK must land kick within 2m of target. 15 reps left foot, 15 reps right foot.' },
      { text: '<strong>Kick vs. Puck Decision (3 min):</strong> Coach signals either "kick" or "puck" after a simulated save. GK must restart with the correct technique within 3 seconds.' }
    ],
    coachingCues: ['"Keep your head down through contact!"', '"Toe up — don\'t stab at it!"', '"Short kick for short distances — save the power puckout for distance."', '"Land it softly — your defender needs to catch it!"'],
    progressions: [
      { level: 'Easier', text: 'Target at 15m. Kick from standing still.' },
      { level: 'Standard', text: 'Target at 20m. Kick immediately after a simulated save (drop to ground and recover).' },
      { level: 'Harder', text: 'Moving target — defender runs a route; GK must lead them with the kick.' }
    ],
    safety: 'Ensure GK does not slip when striking off wet ground. Non-slip footwear essential. No full-pace kicking during the mechanics phase.',
    successCriteria: [
      'Kicked ball reaches target within 2m in 10/15 attempts.',
      'GK uses correct foot for the kick based on which side the target is on.',
      'GK makes correct technique choice (kick vs. puck) 8/10 times on coach signal.'
    ],
    diagram: { gk: {x:50,y:12}, defenders: [{x:30,y:50,label:'D'},{x:70,y:50,label:'D'}], attackers: [], cones: [] }
  },

  {
    id: 'pd-10', category: 'Puckout & Distribution', categoryIcon: '🏑',
    sport: 'Both', ageGroup: 'Senior', difficulty: 'Harder',
    title: 'The Puckout Pressure Test',
    subtitle: 'Full match-simulation puckout decision making',
    duration: '25 mins', players: '8–12', space: 'Full Pitch Half',
    objective: [
      { icon: '🏆', text: 'Execute correct puckout decisions in a live small-sided game scenario.' },
      { icon: '🧠', text: 'Apply all puckout types — short, long, switch, quick — in appropriate situations.' },
      { icon: '📢', text: 'Communicate, read, and lead the restart process as the team\'s conductor.' }
    ],
    equipment: ['Full-size goal', '20+ sliotars', '5 defenders', '5 forwards', 'Bibs'],
    phases: [
      { text: '<strong>Briefing (3 min):</strong> Coach sets a "puckout menu" for this session — e.g., no long puckouts in the first 5 mins, must go short. Changes rules each round to force adaptation.' },
      { text: '<strong>Live Puckout Game (17 min):</strong> 5 vs 5 small-sided game. Every time ball goes dead over the end line, the GK restarts. Score 2 pts if puckout leads directly to a shot, 1 pt if retained possession. Track for GK.' },
      { text: '<strong>Debrief (5 min):</strong> Coach reviews 3 key decisions — good and bad. GK explains their reasoning out loud for each reviewed puckout.' }
    ],
    coachingCues: ['"What were you looking at when you set the ball?"', '"Did you see the press coming? What was the clue?"', '"You had a second — did you use it or waste it?"', '"Great restart — what made it work?"'],
    progressions: [
      { level: 'Easier', text: 'No restriction on puckout type. Focus is on execution quality only.' },
      { level: 'Standard', text: 'One restriction per round (e.g., no long ball, or must go right side).' },
      { level: 'Harder', text: 'Forwards can press GK immediately — time window is 3 seconds from ball going dead.' }
    ],
    safety: 'Forwards must not enter the end zone during a puckout — minimum 5m. Small-sided game should be played with standard safety rules: helmets on at all times.',
    successCriteria: [
      'GK successfully leads every restart without coach prompting.',
      'At least 60% of puckouts result in retained possession.',
      'GK can articulate the reasoning for their decision in the debrief.'
    ],
    diagram: { gk: {x:50,y:12}, defenders: [{x:20,y:45,label:'D'},{x:40,y:50,label:'D'},{x:60,y:50,label:'D'},{x:80,y:45,label:'D'}], attackers: [{x:25,y:60,label:'F'},{x:45,y:65,label:'F'},{x:55,y:65,label:'F'},{x:75,y:60,label:'F'}], cones: [] }
  },

  // ═══════════════════════════════════════════════════════════
  //  CATEGORY 3 — FOOTWORK & POSITIONING
  // ═══════════════════════════════════════════════════════════

  {
    id: 'fp-01', category: 'Footwork & Positioning', categoryIcon: '👟',
    sport: 'Both', ageGroup: 'Senior', difficulty: 'Standard',
    title: 'The T-Position Set Drill',
    subtitle: 'Mastering the correct GK ready stance',
    duration: '15 mins', players: '2', space: 'Goal Area',
    objective: [
      { icon: '🦶', text: 'Establish and hold the correct set position before every shot.' },
      { icon: '⚖️', text: 'Keep weight forward and balanced on the balls of the feet.' },
      { icon: '🧠', text: 'Understand how body shape affects dive range and reaction time.' }
    ],
    equipment: ['Goal', '8 sliotars', 'Cones for footwork markers', 'Full-length mirror (optional)'],
    phases: [
      { text: '<strong>Position Analysis (4 min):</strong> GK demonstrates their natural set position. Coach corrects: feet shoulder-width, knees slightly bent, weight forward, hands at hip height and out from body.' },
      { text: '<strong>Hold & Fire (8 min):</strong> GK holds the set position while coach fires 10 balls (left, right, high, low). GK must not move until ball leaves the coach\'s hand. Focus: position quality over speed.' },
      { text: '<strong>Position Check Game (3 min):</strong> If GK is not in the set position when ball is struck, shot counts double. GK must stay disciplined even between shots.' }
    ],
    coachingCues: ['"Weight on balls of feet — not heels!"', '"Hands out — not tucked in!"', '"Stay ready between every shot!"', '"Bent knees release energy faster — stand straight and you\'re slow!"'],
    progressions: [
      { level: 'Easier', text: 'Coach calls "set!" before each shot — GK has 2 seconds to adopt position.' },
      { level: 'Standard', text: 'No warning — shots fired from set position baseline.' },
      { level: 'Harder', text: 'GK must sprint 5m, recover to position, and face shot — all within 3 seconds.' }
    ],
    safety: 'No safety concerns for this drill. Ensure GK is warmed up before diving in the Hold & Fire phase.',
    successCriteria: [
      'GK is in correct set position for 9/10 shots.',
      'Weight is visibly forward — no backward lean observed by coach.',
      'Hands are out from body and at correct height.'
    ],
    diagram: { gk: {x:50,y:12}, defenders: [], attackers: [{x:50,y:60,label:'C'}], cones: [] }
  },

  {
    id: 'fp-02', category: 'Footwork & Positioning', categoryIcon: '👟',
    sport: 'Both', ageGroup: 'U16', difficulty: 'Standard',
    title: 'Agility Ladder Quick Feet',
    subtitle: 'Fast-twitch foot speed for rapid repositioning',
    duration: '15 mins', players: '1–3', space: 'Any flat area',
    objective: [
      { icon: '⚡', text: 'Develop rapid footwork for lateral movement and diagonal shuffles.' },
      { icon: '🦶', text: 'Improve foot-to-ground contact speed — lighter and faster steps.' },
      { icon: '💪', text: 'Build the physical foundation for explosive GK lateral movement.' }
    ],
    equipment: ['Agility ladder (5–10m)', 'Cones', 'Timer'],
    phases: [
      { text: '<strong>Basic Ladder Drills (5 min):</strong> 3 patterns — two-foot in/out (each rung), lateral shuffle (sideways through ladder), and Icky Shuffle (cross-step pattern). 3 reps of each at easy pace.' },
      { text: '<strong>GK-Specific Patterns (7 min):</strong> "Save Shuffle" — GK shuffles along ladder (one foot each rung) then explodes to touch a cone 2m to the side. Simulates post-to-post recovery followed by a save reaction.' },
      { text: '<strong>Timed Ladder Challenge (3 min):</strong> GK completes full ladder length as fast as possible. Record time each session. Target improvement of 0.2 sec per week.' }
    ],
    coachingCues: ['"Light feet — don\'t stamp!"', '"Eyes forward — not looking at feet!"', '"Hips drive the movement — not the arms!"', '"Stay low — GK height is your advantage!"'],
    progressions: [
      { level: 'Easier', text: 'Slower pace; two-foot in each rung for control.' },
      { level: 'Standard', text: 'Full GK-specific patterns as described.' },
      { level: 'Harder', text: 'Partner feeds a ball at the end of each ladder run — GK must save immediately after completing the pattern.' }
    ],
    safety: 'Ensure ladder is flat on dry ground. Wet ladders are a slip hazard — move to gym if outdoors is wet.',
    successCriteria: [
      'GK completes each pattern without stepping on the ladder.',
      'Movement stays light and quick — no heavy stamping.',
      'Transition from ladder to save reaction is smooth and immediate.'
    ],
    diagram: { gk: {x:50,y:25}, defenders: [], attackers: [], cones: [{x:25,y:25},{x:50,y:25},{x:75,y:25}] }
  },

  {
    id: 'fp-03', category: 'Footwork & Positioning', categoryIcon: '👟',
    sport: 'Both', ageGroup: 'Senior', difficulty: 'Standard',
    title: 'Angle Reduction Walk',
    subtitle: 'Stepping off the line to cut angles effectively',
    duration: '18 mins', players: '2–3', space: 'Goal Area + 25m',
    objective: [
      { icon: '📐', text: 'Understand how moving off the line reduces a striker\'s target angle.' },
      { icon: '🦶', text: 'Move to the optimal position based on where the ball is — not just guessing.' },
      { icon: '🧠', text: 'Know the limits — when to come off the line and when to hold it.' }
    ],
    equipment: ['Goal', '2 marker cones', 'Hurl to mark bisector line', 'Coach or partner'],
    phases: [
      { text: '<strong>Angle Theory (4 min):</strong> Coach demonstrates with a cone and string the shooting angle from 3 positions: straight on, 30° wide, and 45° wide. GK sees visually how advancing reduces the angle.' },
      { text: '<strong>Bisector Walk (8 min):</strong> For each ball position on the 21m arc, GK sets foot on the bisector of the angle (the line halfway between near and far post from the ball). Coach checks positioning. 10 positions.' },
      { text: '<strong>Shot Response (6 min):</strong> GK moves to correct position; coach fires a shot. GK must not over-advance — if beaten for chip, they must adjust depth. 10 shots from varying angles.' }
    ],
    coachingCues: ['"If you see both posts equally — you\'re on the bisector!"', '"Come off the line — but not too far!"', '"Ball wide = bigger step off line. Ball central = smaller step."', '"Cover the near post — it\'s your primary!"'],
    progressions: [
      { level: 'Easier', text: 'GK shown correct position and then holds it — no movement during shot.' },
      { level: 'Standard', text: 'GK finds position independently then faces shot.' },
      { level: 'Harder', text: 'Ball moved twice before shot — GK must adjust angle twice quickly before the shot is struck.' }
    ],
    safety: 'No safety concerns specific to this drill. Warm up before shot-response phase.',
    successCriteria: [
      'GK is on or within 1m of the correct bisector in 8/10 positions.',
      'GK never concedes a near-post goal from a central shot.',
      'GK does not over-advance — beaten by chip fewer than 2/10 shots.'
    ],
    diagram: { gk: {x:50,y:22}, defenders: [], attackers: [{x:25,y:65,label:'S'},{x:75,y:65,label:'S'}], cones: [{x:50,y:12}] }
  },

  {
    id: 'fp-04', category: 'Footwork & Positioning', categoryIcon: '👟',
    sport: 'Both', ageGroup: 'U14', difficulty: 'Easier',
    title: 'Post-to-Post Sprint Recovery',
    subtitle: 'Lateral recovery sprint from post to post',
    duration: '15 mins', players: '2', space: 'Goal Width',
    objective: [
      { icon: '🏃', text: 'Build the recovery speed to reach the far post after a deflection.' },
      { icon: '⚡', text: 'Develop explosive lateral acceleration from a standing start.' },
      { icon: '🛡️', text: 'Understand that a deflected shot can go anywhere — recovery must be instant.' }
    ],
    equipment: ['Full-size goal', 'Timer', 'Cones at each post'],
    phases: [
      { text: '<strong>Timed Sprints (6 min):</strong> GK starts at the centre of the goal line. On "Go!", sprints to touch right post, back to centre, touches left post, back to centre. Timed. Target: under 4 seconds.' },
      { text: '<strong>Reaction Sprints (6 min):</strong> Coach points left or right 1 second before saying "Go!". GK must react and sprint to that post first. Tests directional decision speed.' },
      { text: '<strong>Save & Recover (3 min):</strong> GK makes a save to one side (rolled ball), then must immediately sprint to the opposite post. Simulates a deflection going wide of the near post.' }
    ],
    coachingCues: ['"Drive your inside foot — don\'t cross your legs!"', '"Drop step first — then sprint!"', '"Lowest GK wins the race to the post!"', '"Always back to centre after each touch!"'],
    progressions: [
      { level: 'Easier', text: 'Walk the pattern first to understand the footwork. Then jog speed.' },
      { level: 'Standard', text: 'Full sprint as described.' },
      { level: 'Harder', text: 'Reduce target time to 3.5 seconds. Add a simulated aerial challenge at the post (jump and touch) before returning.' }
    ],
    safety: 'Ensure posts are padded or soft post protectors are in place for U14 sessions. GK should be fully warm before sprint work.',
    successCriteria: [
      'GK completes post-to-post sprint in under 4 seconds.',
      'Footwork is a lateral drop-step, not a straight run-and-pivot.',
      'Recovery to opposite post happens within 2 seconds of a save.'
    ],
    diagram: { gk: {x:50,y:12}, defenders: [], attackers: [], cones: [{x:18,y:12},{x:82,y:12}] }
  },

  {
    id: 'fp-05', category: 'Footwork & Positioning', categoryIcon: '👟',
    sport: 'Both', ageGroup: 'Senior', difficulty: 'Harder',
    title: 'Backpedal & Attack',
    subtitle: 'Explosive backward-to-forward change of direction',
    duration: '20 mins', players: '2–3', space: 'Goal Area + 20m',
    objective: [
      { icon: '🔁', text: 'Develop the ability to backpedal quickly to defend a lob, then re-attack forward.' },
      { icon: '⚡', text: 'Train the deceleration and re-acceleration pattern critical for GKs.' },
      { icon: '🦶', text: 'Maintain balance when moving backward at pace.' }
    ],
    equipment: ['Goal', 'Cones at 5m, 10m, 15m from line', 'Coach or partner with ball'],
    phases: [
      { text: '<strong>Backpedal Pattern (5 min):</strong> GK backpedals from goal line to 15m cone, then sprints forward past the 5m cone. 10 reps. Focus on staying low and not crossing feet while backpedaling.' },
      { text: '<strong>Lob Response (10 min):</strong> GK in set position at goal line. Partner lobs ball over GK. GK backpedals, assesses, and must decide: tip over bar, catch, or smother? 10 reps.' },
      { text: '<strong>Attack & Reset (5 min):</strong> After a lob is dealt with, ball is immediately played to feet. GK must instantly transition from backward movement to forward attack. Tests gear-change.' }
    ],
    coachingCues: ['"Back on the inside edge — don\'t fall back!"', '"Assess quickly — tip it or catch it?"', '"Commit to one decision — half-measures cost goals!"', '"Re-attack instantly — don\'t freeze after the lob!"'],
    progressions: [
      { level: 'Easier', text: 'Lob is slow and predictable — GK always catches.' },
      { level: 'Standard', text: 'Varying speed and direction of lob.' },
      { level: 'Harder', text: 'Second ball is played in from the side immediately after the lob is dealt with — GK must also save or clear this.' }
    ],
    safety: 'Ensure GK backpedals on a clear, flat surface with no obstacles behind them. No players should stand behind the goal during this drill.',
    successCriteria: [
      'GK moves to the correct position to deal with every lob.',
      'Backpedaling motion is smooth and controlled — no stumbles.',
      'Re-attack forward happens within 1 second of completing the lob save.'
    ],
    diagram: { gk: {x:50,y:35}, defenders: [], attackers: [{x:50,y:70,label:'S'}], cones: [{x:50,y:12},{x:50,y:22},{x:50,y:32}] }
  },

  {
    id: 'fp-06', category: 'Footwork & Positioning', categoryIcon: '👟',
    sport: 'Both', ageGroup: 'U16', difficulty: 'Standard',
    title: 'The Cone Weave',
    subtitle: 'Lateral agility through a cone circuit',
    duration: '12 mins', players: '1–4', space: 'Open Training Area',
    objective: [
      { icon: '🦶', text: 'Improve change-of-direction ability at pace — key for repositioning.' },
      { icon: '⚡', text: 'Develop hip rotation and cross-over step mechanics.' },
      { icon: '💪', text: 'Build lower-body strength and stability through dynamic movement.' }
    ],
    equipment: ['8–10 cones spaced 1.5m apart in a line', 'Timer'],
    phases: [
      { text: '<strong>Weave Pattern (4 min):</strong> GK weaves through cones using lateral shuffle (never crossing feet). 5 reps each direction. Time each run.' },
      { text: '<strong>GK-Specific Weave (5 min):</strong> After completing the weave, partner fires a shot from 10m. GK must be in set position before the shot. Tests ability to save immediately after movement.' },
      { text: '<strong>Timed Competition (3 min):</strong> If multiple GKs in session — race through the weave. Competitive element drives speed.' }
    ],
    coachingCues: ['"Low hips — power the change!"', '"Drive off the outside foot!"', '"Smooth is fast — don\'t lunge!"', '"Eyes up — you\'re a GK, not a 100m sprinter!"'],
    progressions: [
      { level: 'Easier', text: 'Wider cone spacing (2m); slower pace.' },
      { level: 'Standard', text: '1.5m spacing; full pace.' },
      { level: 'Harder', text: 'Reduce spacing to 1m; add ball to weave (balance challenge).' }
    ],
    safety: 'Check cones are light foam/rubber, not hard plastic, to avoid trip injuries. Dry surface only.',
    successCriteria: [
      'GK completes weave without knocking any cones.',
      'Movement stays lateral — no forward lean or crossing feet.',
      'Save quality after weave matches quality from standing start.'
    ],
    diagram: { gk: {x:50,y:50}, defenders: [], attackers: [], cones: [{x:25,y:50},{x:35,y:50},{x:45,y:50},{x:55,y:50},{x:65,y:50},{x:75,y:50}] }
  },

  {
    id: 'fp-07', category: 'Footwork & Positioning', categoryIcon: '👟',
    sport: 'Both', ageGroup: 'Senior', difficulty: 'Standard',
    title: 'Mirror the Attacker',
    subtitle: 'Tracking attacker movement without the ball',
    duration: '15 mins', players: '2', space: 'Goal Area',
    objective: [
      { icon: '👁️', text: 'Track an attacker\'s movement to remain in the optimal position relative to both ball and attacker.' },
      { icon: '🦶', text: 'Move in relation to attacker without watching their feet — read their hips and shoulders.' },
      { icon: '🧠', text: 'Understand that positioning adjusts continuously — not just when the shot is taken.' }
    ],
    equipment: ['Goal', 'Cones to mark ball position', 'Partner as attacker'],
    phases: [
      { text: '<strong>Shadow Tracking (5 min):</strong> Attacker moves freely in the goal area without the ball. GK must maintain the correct position relative to a fixed "ball" cone. GK moves every time the attacker moves. No ball.' },
      { text: '<strong>Live Tracking (7 min):</strong> Ball is held by a server at a fixed position. Attacker moves to various positions looking for space. GK must cover the attacker\'s run-in angle at all times.' },
      { text: '<strong>Ball + Attacker (3 min):</strong> Server passes to the attacker on their run — GK must both track the attacker AND the ball simultaneously. Attacker shoots on receipt.' }
    ],
    coachingCues: ['"Ball-side and goal-side — always!"', '"Read their hips — not their feet!"', '"You move when THEY move — not when they shoot!"', '"Your starting position changes as they change."'],
    progressions: [
      { level: 'Easier', text: 'Attacker moves slowly in straight lines only.' },
      { level: 'Standard', text: 'Attacker moves freely with random direction changes.' },
      { level: 'Harder', text: 'Two attackers — GK must position relative to both simultaneously.' }
    ],
    safety: 'No physical contact between GK and attacker during the tracking phase.',
    successCriteria: [
      'GK is always between the attacker\'s most likely shooting position and the goal.',
      'Movement is proactive — adjusting before the attacker settles, not after.',
      'GK does not "ball watch" — attacker movement is tracked throughout.'
    ],
    diagram: { gk: {x:50,y:18}, defenders: [], attackers: [{x:40,y:50,label:'A'}], cones: [{x:70,y:70}] }
  },

  {
    id: 'fp-08', category: 'Footwork & Positioning', categoryIcon: '👟',
    sport: 'Both', ageGroup: 'U14', difficulty: 'Easier',
    title: 'The Power Step',
    subtitle: 'Explosive first step mechanics for diving',
    duration: '12 mins', players: '1–3', space: 'Goal Area',
    objective: [
      { icon: '💥', text: 'Develop explosive first step to the right and left before diving.' },
      { icon: '🦶', text: 'Use the correct foot to push off — not just falling sideways.' },
      { icon: '⚡', text: 'Build the fast-twitch power needed for a full diving save.' }
    ],
    equipment: ['Soft ground or gym mat', 'Cones 2m left and right', 'Coach or partner'],
    phases: [
      { text: '<strong>Isolated Step (4 min):</strong> GK stands in set position. On "Go left!" — GK steps the left foot to the left and drives off it. On "Go right!" — right foot drives right. Slow motion × 10 reps each side.' },
      { text: '<strong>Step + Touch (5 min):</strong> Cones placed 2m each side. GK must power step and touch the cone within 1 second of the call. 10 reps each side.' },
      { text: '<strong>Step + Dive (3 min):</strong> Same as above, but GK executes a full dive after the power step. Partner rolls a ball to that side simultaneously.' }
    ],
    coachingCues: ['"Drive off the INSIDE foot for lateral step!"', '"Step first — then dive — don\'t skip the step!"', '"Short and explosive — not a long slow step!"', '"Land on your hands and hip — not your shoulder!"'],
    progressions: [
      { level: 'Easier', text: 'No time pressure — slow controlled steps only.' },
      { level: 'Standard', text: 'Timed step + touch challenge.' },
      { level: 'Harder', text: 'Partner calls the direction at random and immediately rolls the ball — GK must step and dive in under 0.8 seconds.' }
    ],
    safety: 'Practice diving on a gym mat or soft grass before introducing the ball. Ensure GK pads elbows and hips if diving repeatedly on hard ground.',
    successCriteria: [
      'GK always uses the correct driving foot (opposite to dive direction).',
      'Power step is short and explosive — 1 foot contact before dive.',
      'Landing is controlled — no crash-landing on shoulder.'
    ],
    diagram: { gk: {x:50,y:12}, defenders: [], attackers: [], cones: [{x:30,y:18},{x:70,y:18}] }
  },

  {
    id: 'fp-09', category: 'Footwork & Positioning', categoryIcon: '👟',
    sport: 'Both', ageGroup: 'Senior', difficulty: 'Standard',
    title: 'Crossbar Awareness Jump',
    subtitle: 'Spatial awareness and vertical reach training',
    duration: '15 mins', players: '1–3', space: 'Goal Area',
    objective: [
      { icon: '📏', text: 'Develop spatial awareness of the crossbar height relative to the GK\'s reach.' },
      { icon: '🦘', text: 'Improve maximum vertical jump for catching or tipping aerial balls.' },
      { icon: '🧠', text: 'Learn to gauge whether to tip or catch based on trajectory.' }
    ],
    equipment: ['Full-size goal', 'Chalk or tape mark on post at GK\'s highest reach', 'Ball'],
    phases: [
      { text: '<strong>Max Reach Calibration (4 min):</strong> GK jumps and marks the highest point they can reach on the post with chalk. This is their "tip zone" — anything above this must be tipped. Anything below can be caught.' },
      { text: '<strong>Jump + Touch (6 min):</strong> GK touches the crossbar 15 times alternating both hands. Two-footed take-off. One-footed take-off left and right. Measures vertical improvement over sessions.' },
      { text: '<strong>Ball Decision (5 min):</strong> Server lobs balls at varying heights. GK decides catch vs. tip based on their calibrated reach mark. 10 reps.' }
    ],
    coachingCues: ['"Know your reach — don\'t guess!"', '"Two-footed when time allows — more power!"', '"Arm fully extended at peak of jump!"', '"Trust your calibration — you know your ceiling!"'],
    progressions: [
      { level: 'Easier', text: 'Focus on jump mechanics only — no ball decision required.' },
      { level: 'Standard', text: 'Ball decision combined with jump as described.' },
      { level: 'Harder', text: 'Add a forward challenging from behind — GK must claim ball safely while under pressure.' }
    ],
    safety: 'Ensure GK lands safely after each jump — feet together, knees soft. No collisions with the post during jump training. Use post protectors.',
    successCriteria: [
      'GK correctly distinguishes catch vs. tip in 8/10 reps.',
      'Two-footed take-off achieves 10% more height than one-footed.',
      'No aerial balls hit the crossbar — either tipped cleanly or caught below bar.'
    ],
    diagram: { gk: {x:50,y:12}, defenders: [], attackers: [{x:50,y:55,label:'S'}], cones: [] }
  },

  {
    id: 'fp-10', category: 'Footwork & Positioning', categoryIcon: '👟',
    sport: 'Both', ageGroup: 'U16', difficulty: 'Harder',
    title: 'The Full Arc Reset',
    subtitle: 'Repositioning rapidly as ball moves across the pitch',
    duration: '20 mins', players: '3–5', space: 'Goal + 40m Wide',
    objective: [
      { icon: '🔄', text: 'Reposition rapidly as the ball switches from one side of the pitch to the other.' },
      { icon: '⚡', text: 'Move across the full arc of the goal in under 2 seconds.' },
      { icon: '🧠', text: 'Never be caught flat-footed when the ball switches — always moving toward the new position.' }
    ],
    equipment: ['Full-size goal', '2 servers at opposite wide positions', '10 sliotars'],
    phases: [
      { text: '<strong>Ball Switch Only (5 min):</strong> Two servers pass the ball between them across the front of the goal. GK repositions correctly for each position — no shooting yet. 20 switches.' },
      { text: '<strong>Switch + Shoot (10 min):</strong> After 2–4 switches, server randomly fires at goal. GK must be in correct position before the shot. If caught out of position, the point counts double.' },
      { text: '<strong>Speed Challenge (5 min):</strong> Ball switches every 2 seconds. GK must get to correct position before each switch. Maintain for 30 seconds. 3 sets.' }
    ],
    coachingCues: ['"Ball moves — you move! Never static!"', '"Small shuffles — always adjusting!"', '"Anticipate the switch — watch the passer\'s body!"', '"Halfway there before the ball arrives — not after!"'],
    progressions: [
      { level: 'Easier', text: 'Slow ball movement; 4 seconds between switches.' },
      { level: 'Standard', text: 'Ball switches every 3 seconds; shot at random.' },
      { level: 'Harder', text: 'Ball switches every 1.5 seconds; GK must also call "switch!" each time.' }
    ],
    safety: 'No safety concerns specific to this drill. Ensure servers are clear of the GK\'s movement path.',
    successCriteria: [
      'GK is in correct position for 8/10 shots.',
      'Movement is continuous — no moments of complete stillness.',
      'GK is never caught by a shot while moving in the wrong direction.'
    ],
    diagram: { gk: {x:50,y:12}, defenders: [], attackers: [{x:15,y:55,label:'S'},{x:85,y:55,label:'S'}], cones: [] }
  },

  // ═══════════════════════════════════════════════════════════
  //  CATEGORY 4 — HANDLING & BALL CONTROL
  // ═══════════════════════════════════════════════════════════

  {
    id: 'hc-01', category: 'Handling & Ball Control', categoryIcon: '✋',
    sport: 'Both', ageGroup: 'Senior', difficulty: 'Standard',
    title: 'The High Ball Circuit',
    subtitle: 'Catching high sliotars under physical pressure',
    duration: '20 mins', players: '3–5', space: 'Goal Area',
    objective: [
      { icon: '🙌', text: 'Catch high sliotars cleanly and securely from a full jump.' },
      { icon: '🗣️', text: 'Claim every aerial ball with an authoritative "Keeper!" call.' },
      { icon: '💪', text: 'Maintain control under physical and vocal pressure from forwards.' }
    ],
    equipment: ['Goal', '15 sliotars', '2 forwards or coaches to loft balls', 'Bibs'],
    phases: [
      { text: '<strong>Clean High Catch (6 min):</strong> Server lobs balls from 15m. GK jumps and catches cleanly. Focus: two-handed catch at highest point, eyes on ball, controlled landing. 15 reps.' },
      { text: '<strong>Contested Catch (10 min):</strong> Add a forward who challenges from behind. GK must catch "through" the challenge — call it, jump early, hold the ball firmly. Forward is passive (no full challenge).' },
      { text: '<strong>Claim + Distribution (4 min):</strong> After every catch, GK distributes immediately. Combines handling with puckout in one fluid action. 10 reps.' }
    ],
    coachingCues: ['"Call it early — before you jump!"', '"Attack the ball — don\'t wait for it!"', '"Elbows out on landing — protect the ball!"', '"Catch at the highest point — don\'t let it drop to you!"'],
    progressions: [
      { level: 'Easier', text: 'No physical challenge — clean catches only. Build confidence.' },
      { level: 'Standard', text: 'Passive challenge from forward — shoulder to shoulder.' },
      { level: 'Harder', text: 'Full competitive aerial ball — forward fights for possession. GK must win it cleanly.' }
    ],
    safety: 'Forward must approach from the side — never from behind at full speed. GK must call the ball before jumping. No elbowing or pulling.',
    successCriteria: [
      'GK calls "Keeper!" before every aerial ball.',
      'Ball is caught at the highest point of the jump in 8/10 reps.',
      'No fumbles under passive challenge.'
    ],
    diagram: { gk: {x:50,y:12}, defenders: [], attackers: [{x:45,y:40,label:'A'},{x:55,y:40,label:'A'}], cones: [] }
  },

  {
    id: 'hc-02', category: 'Handling & Ball Control', categoryIcon: '✋',
    sport: 'Both', ageGroup: 'U14', difficulty: 'Easier',
    title: 'Ground Ball Pickup',
    subtitle: 'Scooping and securing rolling ground balls',
    duration: '15 mins', players: '2–3', space: 'Goal Area',
    objective: [
      { icon: '🙌', text: 'Scoop ground-rolling balls cleanly using both hands around the ball.' },
      { icon: '🦶', text: 'Adopt the correct body position — knee behind the ball, body low.' },
      { icon: '⚡', text: 'Secure the ball quickly and prepare to distribute without hesitation.' }
    ],
    equipment: ['Goal', '10 sliotars', 'Coach or partner to roll balls', 'Bibs'],
    phases: [
      { text: '<strong>Technique (4 min):</strong> Coach demonstrates the scoop — lead knee behind the ball, hands form a basket shape, eyes on the ball all the way into the hands. GK practises without a ball (shadow). ' },
      { text: '<strong>Slow Rolls (6 min):</strong> Partner rolls balls at moderate pace to left, centre, and right. GK scoops cleanly. 15 reps.' },
      { text: '<strong>Pace Variation (5 min):</strong> Partner varies the pace — slow, medium, and fast rolls. GK must adapt body drop speed to the ball speed.' }
    ],
    coachingCues: ['"Knee down — body behind it!"', '"Head over the ball — don\'t stand up early!"', '"Two hands all the way — don\'t pinch one hand!"', '"Scoop and immediately look up — where are you distributing?"'],
    progressions: [
      { level: 'Easier', text: 'Rolls along the ground at walking pace. GK stationary.' },
      { level: 'Standard', text: 'Rolls at jog pace to varied positions. GK moves to meet ball.' },
      { level: 'Harder', text: 'Rolls at full pace with a forward running in — GK must scoop and get back up before contact.' }
    ],
    safety: 'U14 players should practice ground scoops at a controlled pace before adding pressure. Knees on wet ground can be slippery — use shin pads.',
    successCriteria: [
      'No ground balls allowed to roll under the body.',
      'Lead knee is always positioned behind the ball in the line of its travel.',
      'Ball is secured in both hands before GK rises — not one-handed.',
    ],
    diagram: { gk: {x:50,y:12}, defenders: [], attackers: [{x:30,y:55,label:'R'},{x:70,y:55,label:'R'}], cones: [] }
  },

  {
    id: 'hc-03', category: 'Handling & Ball Control', categoryIcon: '✋',
    sport: 'Both', ageGroup: 'U16', difficulty: 'Standard',
    title: 'Two-Hand Security Drill',
    subtitle: 'Building the instinct for a two-hand catch',
    duration: '15 mins', players: '2', space: 'Any Area',
    objective: [
      { icon: '🙌', text: 'Always use two hands to secure the ball — eliminate one-hand fumbles.' },
      { icon: '💪', text: 'Develop strong wrist stability so the ball does not pop loose.' },
      { icon: '🧠', text: 'Understand the body position that promotes two-hand security.' }
    ],
    equipment: ['10 sliotars', 'Wall or partner', 'Gym mat (optional)'],
    phases: [
      { text: '<strong>Partner Chest Passes (5 min):</strong> Partner fires flat chest-height balls from 5m. GK must catch with both hands and immediately punch the ball back. 20 reps — both hands must make contact or rep does not count.' },
      { text: '<strong>One-Hand Reach, Two-Hand Secure (6 min):</strong> Ball thrown wide so GK must reach to one side — but GK must bring the other hand across to secure before drawing back. 10 reps each side.' },
      { text: '<strong>Squeeze Test (4 min):</strong> GK catches ball; partner immediately tries to poke it out (lightly). GK resists for 2 full seconds while maintaining strong grip. 10 reps.' }
    ],
    coachingCues: ['"One hand gets there, TWO hands hold it!"', '"Squeeze tight — then look to distribute!"', '"Soft hands to catch, firm hands to secure!"', '"Both thumbs pointing up on a mid-height catch!"'],
    progressions: [
      { level: 'Easier', text: 'All throws are straight — no reaching required.' },
      { level: 'Standard', text: 'Varied height and direction; reach required.' },
      { level: 'Harder', text: 'Partner fires at varying pace; immediately rushes in to challenge after throw.' }
    ],
    safety: 'The squeeze test should be firm but not aggressive. Partners should not yank or twist — a simple gentle poke or push.',
    successCriteria: [
      'GK secures every catch with two hands in 9/10 reps.',
      'No fumbles during the squeeze test.',
      'Reaction to bring second hand across is immediate — no hesitation.'
    ],
    diagram: { gk: {x:50,y:50}, defenders: [], attackers: [{x:50,y:25,label:'P'}], cones: [] }
  },

  {
    id: 'hc-04', category: 'Handling & Ball Control', categoryIcon: '✋',
    sport: 'Both', ageGroup: 'Senior', difficulty: 'Standard',
    title: 'The Wet Ball Challenge',
    subtitle: 'Secure handling in wet and difficult conditions',
    duration: '15 mins', players: '2–4', space: 'Goal Area',
    objective: [
      { icon: '🌧️', text: 'Maintain secure ball handling when the sliotar is wet and slippery.' },
      { icon: '🙌', text: 'Adjust catching technique — more focus on wrapping than fingertip catches.' },
      { icon: '🧠', text: 'Develop mental confidence in wet conditions — no hesitation on aerial balls.' }
    ],
    equipment: ['Full-size goal', '10 sliotars (wetted under a tap or in bucket)', 'Bibs'],
    phases: [
      { text: '<strong>Wet Ball Awareness (3 min):</strong> GK handles and passes a wet sliotar — getting used to the feel. No pressure, just familiarisation.' },
      { text: '<strong>Wet Catch Drill (7 min):</strong> Serve wet sliotars at various heights. GK must catch securely. Encourage wrapping hands around the ball rather than fingertip catching. 15 reps.' },
      { text: '<strong>Wet Aerial Challenge (5 min):</strong> Lofted wet ball with a forward challenging. GK must call and catch — or punch away rather than risk a fumble.' }
    ],
    coachingCues: ['"Wrap — don\'t grip with fingertips in the wet!"', '"Two hands ALWAYS in wet conditions!"', '"If in doubt — PUNCH it. Don\'t risk a fumble!"', '"Stay confident — wet ball is the same challenge for everyone!"'],
    progressions: [
      { level: 'Easier', text: 'Ball slightly damp only — not fully wet.' },
      { level: 'Standard', text: 'Fully wet ball as described.' },
      { level: 'Harder', text: 'Wet ball + slippery gloves + passive forward challenge. Full wet-day simulation.' }
    ],
    safety: 'Wet ground makes diving more hazardous. Assess ground conditions before dive work. If ground is frozen or icy, replace dive drills with standing saves only.',
    successCriteria: [
      'GK secures wet ball in 7/10 catches — no fumbles to ground.',
      'GK uses punch clearance when appropriate rather than forcing a catch.',
      'Aerial ball is called and dealt with confidently — no hesitation.'
    ],
    diagram: { gk: {x:50,y:12}, defenders: [], attackers: [{x:50,y:55,label:'S'}], cones: [] }
  },

  {
    id: 'hc-05', category: 'Handling & Ball Control', categoryIcon: '✋',
    sport: 'Both', ageGroup: 'U16', difficulty: 'Standard',
    title: 'Over-the-Shoulder Catch',
    subtitle: 'Turning and catching balls delivered behind the GK',
    duration: '15 mins', players: '2', space: 'Goal Area',
    objective: [
      { icon: '🔁', text: 'Develop the ability to turn quickly and catch a ball played over the shoulder.' },
      { icon: '👀', text: 'Pick up ball flight quickly after turning — critical for lobs and crosses.' },
      { icon: '🙌', text: 'Catch securely while moving backward at pace.' }
    ],
    equipment: ['Goal', '12 sliotars', 'Partner to deliver balls from behind GK'],
    phases: [
      { text: '<strong>Back-Turn Drill (4 min):</strong> GK faces the goal. Partner calls "Left!" or "Right!" — GK turns that way and runs back 5m. No ball yet — just the turning mechanics.' },
      { text: '<strong>Turn + Catch (8 min):</strong> Same setup, but partner lobs ball in the turning direction as soon as GK begins to turn. GK must catch it before it bounces. 10 reps each side.' },
      { text: '<strong>Blind Turn (3 min):</strong> GK backpedals toward the ball without a call. Must turn at the last moment and catch. Tests peripheral vision and spatial awareness.' }
    ],
    coachingCues: ['"Turn INSIDE — don\'t run with your back to the ball!"', '"Pick up the ball early — the second your eyes find it!"', '"Head still when catching — don\'t twist into it!"', '"Trust your feel — you know where the goal is!"'],
    progressions: [
      { level: 'Easier', text: 'Call given 2 seconds before ball is delivered.' },
      { level: 'Standard', text: 'Ball delivered simultaneously with call.' },
      { level: 'Harder', text: 'No call — GK must react to ball sound/shadow.' }
    ],
    safety: 'Ensure the area behind the goal is clear — GK is moving backward. Partner should not deliver overly powerful balls during the technique phase.',
    successCriteria: [
      'GK catches 7/10 over-the-shoulder balls before they bounce.',
      'Turning motion is compact and controlled — no stumbling.',
      'GK picks up ball flight within 1 second of completing the turn.'
    ],
    diagram: { gk: {x:50,y:35}, defenders: [], attackers: [{x:50,y:75,label:'P'}], cones: [] }
  },

  {
    id: 'hc-06', category: 'Handling & Ball Control', categoryIcon: '✋',
    sport: 'Both', ageGroup: 'U14', difficulty: 'Easier',
    title: 'The Drop and Catch',
    subtitle: 'Reaction catching from varying heights and drops',
    duration: '12 mins', players: '2', space: 'Any Flat Area',
    objective: [
      { icon: '⚡', text: 'Build rapid hand-eye coordination through drop-and-catch exercises.' },
      { icon: '🙌', text: 'Develop consistent two-hand catching technique from varied angles.' },
      { icon: '🧠', text: 'Improve concentration and focus under repetitive catching conditions.' }
    ],
    equipment: ['3 sliotars (or tennis balls for U14)', 'Flat wall or partner'],
    phases: [
      { text: '<strong>Self Drop (4 min):</strong> GK holds ball at shoulder height with one hand and lets it drop — catches with both hands before second bounce. Progress from low drop (hip) to high drop (overhead).' },
      { text: '<strong>Partner Drops (5 min):</strong> Partner holds ball at various heights (waist, shoulder, overhead) and drops without warning. GK watches the partner\'s hand — catches before bounce. 15 reps.' },
      { text: '<strong>Two-Ball Drops (3 min):</strong> Partner holds one ball in each hand and drops them simultaneously — one toward each side. GK catches one and deflects the other. Tests priority decision.' }
    ],
    coachingCues: ['"Watch the hand — not the ball!"', '"Be ready — every rep like it\'s the last one!"', '"Soft hands — catch it, don\'t grab it!"', '"Two-ball: catch the more dangerous one — deflect the other!"'],
    progressions: [
      { level: 'Easier', text: 'Large foam ball — easier to track and catch.' },
      { level: 'Standard', text: 'Standard sliotar.' },
      { level: 'Harder', text: 'Partner drops from behind a cone so GK cannot see exact position — tests tracking.' }
    ],
    safety: 'Safe for U14. Ensure the sliotar used is appropriate for age group — foam or mini ball for very young players.',
    successCriteria: [
      'GK catches 12/15 drops before second bounce.',
      'Both hands make contact every time.',
      'In two-ball drill, correct priority decision made 7/10 times.'
    ],
    diagram: { gk: {x:50,y:50}, defenders: [], attackers: [{x:50,y:30,label:'P'}], cones: [] }
  },

  {
    id: 'hc-07', category: 'Handling & Ball Control', categoryIcon: '✋',
    sport: 'Both', ageGroup: 'Senior', difficulty: 'Harder',
    title: 'The Pressure Catch',
    subtitle: 'Catching sliotars with a challenging forward present',
    duration: '20 mins', players: '3–5', space: 'Goal Area',
    objective: [
      { icon: '💪', text: 'Maintain clean catching technique while a forward applies physical and vocal pressure.' },
      { icon: '🗣️', text: 'Use vocal and physical presence to deter the forward from the ball.' },
      { icon: '🧠', text: 'Develop the mental toughness to catch decisively under pressure.' }
    ],
    equipment: ['Goal', '15 sliotars', '2 forwards (passive to semi-active)', 'Bibs'],
    phases: [
      { text: '<strong>Passive Challenge (5 min):</strong> Forward stands near GK but cannot move. GK catches 10 high balls — presence only, no physical challenge. Builds habit of committing to the ball.' },
      { text: '<strong>Semi-Active Challenge (10 min):</strong> Forward can move but must give 1 arm\'s length. GK must call, jump, and catch. If GK hesitates — forward wins the ball.' },
      { text: '<strong>Competition (5 min):</strong> GK scores 2 for a clean catch, 1 for a punch, 0 for a fumble. Forward scores 2 for winning the ball. Track scores over 10 reps.' }
    ],
    coachingCues: ['"Call it before you move — not while you\'re jumping!"', '"Attack the ball — first one there wins!"', '"Use your body — box the forward off legally!"', '"Don\'t wait to see where they are — go!"'],
    progressions: [
      { level: 'Easier', text: 'Forward is purely passive — no movement at all.' },
      { level: 'Standard', text: 'Forward can move within 1m radius.' },
      { level: 'Harder', text: 'Full competitive aerial ball — forward can challenge fully within the rules.' }
    ],
    safety: 'No barging, pushing or elbowing. Challenge must be shoulder-to-shoulder within the rules of the game. Forward must approach at controlled pace, not at a sprint during the challenge phase.',
    successCriteria: [
      'GK wins the aerial ball in 7/10 contested reps.',
      'GK calls before every jump — no silent catches.',
      'No fumbles when ball is caught — immediately secured and ready to distribute.'
    ],
    diagram: { gk: {x:50,y:12}, defenders: [], attackers: [{x:45,y:35,label:'A'},{x:55,y:35,label:'A'}], cones: [] }
  },

  {
    id: 'hc-08', category: 'Handling & Ball Control', categoryIcon: '✋',
    sport: 'Hurling', ageGroup: 'Senior', difficulty: 'Standard',
    title: 'Hurl Control Under Pressure',
    subtitle: 'Ball control with the hurl in tight spaces',
    duration: '18 mins', players: '2–4', space: 'Goal Area',
    objective: [
      { icon: '🏑', text: 'Control the sliotar on the hurl in one touch from various deliveries.' },
      { icon: '⚡', text: 'Develop the ability to receive a ball on the hurl and transition instantly to a puckout.' },
      { icon: '💪', text: 'Build confidence with the hurl in tight goal-area situations.' }
    ],
    equipment: ['Hurls for all players', '15 sliotars', 'Cones for control targets'],
    phases: [
      { text: '<strong>Receive + Hold (5 min):</strong> Partner lobs sliotar — GK receives on hurl at full stretch and balances it for 2 seconds. Progress from easy lob to driven delivery. 10 reps.' },
      { text: '<strong>Receive + Pass (8 min):</strong> GK receives on hurl and immediately pucks or hand-passes to a target player. No delay between receiving and distributing. 15 reps varying delivery height.' },
      { text: '<strong>Contested Control (5 min):</strong> Forward closes in immediately after delivery — GK must receive and distribute before challenge arrives. 3-second time limit.' }
    ],
    coachingCues: ['"Soft hands on the hurl — don\'t stiffen up!"', '"Receive and instantly think distribution!"', '"One touch control is your weapon — don\'t bounce twice!"', '"Eyes up on receipt — where does it go next?"'],
    progressions: [
      { level: 'Easier', text: 'Slow, looped deliveries. No forward pressure.' },
      { level: 'Standard', text: 'Varied deliveries; passive forward.' },
      { level: 'Harder', text: 'Full pace driven deliveries; forward presses immediately on delivery.' }
    ],
    safety: 'Ensure all players wear helmets for hurl-to-hurl drills. Control zone must be free of players not involved in the rep.',
    successCriteria: [
      'GK controls ball on hurl in 8/10 reps without dropping.',
      'Distribution follows within 1.5 seconds of receipt.',
      'GK does not fumble when forward applies pressure.'
    ],
    diagram: { gk: {x:50,y:12}, defenders: [{x:70,y:40,label:'T'}], attackers: [{x:50,y:45,label:'F'}], cones: [] }
  },

  {
    id: 'hc-09', category: 'Handling & Ball Control', categoryIcon: '✋',
    sport: 'Both', ageGroup: 'U16', difficulty: 'Standard',
    title: 'Partner Reflex Exchange',
    subtitle: 'Fast-hands reaction with a partner at 3–5m',
    duration: '12 mins', players: '2', space: 'Any Open Area',
    objective: [
      { icon: '⚡', text: 'Develop rapid hand-exchange speed with a partner at close range.' },
      { icon: '🙌', text: 'Improve both hands independently through alternate throws.' },
      { icon: '🧠', text: 'Build focus and concentration across a high-repetition catching circuit.' }
    ],
    equipment: ['2–3 sliotars', 'Partner', 'Flat area'],
    phases: [
      { text: '<strong>Alternate Side Throw (5 min):</strong> Partners stand 3m apart. Partner A throws right → Partner B\'s left; A throws left → B\'s right. Rapid alternating. 30 seconds on, 10 seconds rest. 5 sets.' },
      { text: '<strong>Random Throws (5 min):</strong> Partner A throws randomly — no pattern. GK must read release point and react. 30 sec on/10 sec rest. 4 sets.' },
      { text: '<strong>Two-Ball Exchange (2 min):</strong> Both players have a ball. Simultaneously throw to each other — catch and throw back. Develop independent hand awareness.' }
    ],
    coachingCues: ['"Watch the release — not the ball in flight!"', '"Small, precise throws — not hurling it!"', '"Catch with the hand coming forward — don\'t wait!"', '"Keep your feet moving — don\'t freeze up!"'],
    progressions: [
      { level: 'Easier', text: 'Larger gap (5m); slower throws.' },
      { level: 'Standard', text: '3m gap; medium-paced throws.' },
      { level: 'Harder', text: '2m gap; maximum pace — hand-speed test.' }
    ],
    safety: 'Keep throws at torso height. No head-height throws at close range.',
    successCriteria: [
      'No dropped balls in alternate-side drill for 15+ consecutive exchanges.',
      'Random throws caught cleanly 80% of the time.',
      'Two-ball exchange sustained for 10 successful simultaneous exchanges.'
    ],
    diagram: { gk: {x:35,y:50}, defenders: [], attackers: [{x:65,y:50,label:'P'}], cones: [] }
  },

  {
    id: 'hc-10', category: 'Handling & Ball Control', categoryIcon: '✋',
    sport: 'Both', ageGroup: 'Senior', difficulty: 'Harder',
    title: 'The Fumble Recovery',
    subtitle: 'Quick recovery and resecuring after a dropped ball',
    duration: '15 mins', players: '3–5', space: 'Goal Area',
    objective: [
      { icon: '⚡', text: 'Recover a fumbled ball before a forward can exploit it.' },
      { icon: '🧠', text: 'Develop the mental resilience to stay composed after a mistake.' },
      { icon: '🛡️', text: 'Clear or reclaim a loose ball in the goal area under pressure.' }
    ],
    equipment: ['Goal', '15 sliotars', '2 forwards (semi-active)', 'Bibs'],
    phases: [
      { text: '<strong>Deliberate Fumble (5 min):</strong> GK deliberately drops the ball from chest height and must recover it before it bounces twice. No forward — just speed of recovery.' },
      { text: '<strong>Save + Fumble + Recover (7 min):</strong> GK makes a save, intentionally lets the ball drop, then must reclaim or clear before a forward (starting 5m away on the shot) reaches it. 10 reps.' },
      { text: '<strong>Scramble Save (3 min):</strong> Server fires hard and low — GK is likely to spill. Forward immediately charges in. GK must recover or clear under maximum pressure.' }
    ],
    coachingCues: ['"Fumble is NOT a disaster — recovery is everything!"', '"Get to it BEFORE they do — it\'s still your ball!"', '"If you can\'t secure — punch it away!"', '"Stay low on the ground — don\'t stand up before the ball is safe!"'],
    progressions: [
      { level: 'Easier', text: 'No forward — GK practices recovery mechanics in isolation.' },
      { level: 'Standard', text: 'Forward starts 5m away.' },
      { level: 'Harder', text: 'Forward starts 2m away — GK has a fraction of a second to recover or clear.' }
    ],
    safety: 'Forwards must not dive at the GK during recovery — they can challenge for the ball only, not the person. GK must wear hand protection to avoid injury when palming ground balls under pressure.',
    successCriteria: [
      'GK recovers or clears the fumbled ball in 7/10 contested reps.',
      'No frozen moments after a fumble — immediate reaction every time.',
      'GK stays composed — no panicked or uncontrolled clearances.'
    ],
    diagram: { gk: {x:50,y:12}, defenders: [], attackers: [{x:40,y:40,label:'A'},{x:60,y:40,label:'A'}], cones: [] }
  },

  // ═══════════════════════════════════════════════════════════
  //  CATEGORY 5 — 1V1 & BREAKAWAY
  // ═══════════════════════════════════════════════════════════

  {
    id: 'bk-01', category: '1v1 & Breakaway', categoryIcon: '⚡',
    sport: 'Both', ageGroup: 'Senior', difficulty: 'Standard',
    title: 'The Angle Closer',
    subtitle: 'Narrowing the angle on a 1v1 breakaway',
    duration: '20 mins', players: '3–5', space: 'Goal Area + 30m',
    objective: [
      { icon: '📐', text: 'Advance off the line at the right speed to cut the shooting angle without being lobbed.' },
      { icon: '🦶', text: 'Stay on feet and delay the attacker for as long as possible.' },
      { icon: '🧠', text: 'Read the attacker\'s options and force them toward the post side.' }
    ],
    equipment: ['Full-size goal', 'Cone at various starting positions', '12 sliotars', '2–3 attackers'],
    phases: [
      { text: '<strong>Speed Calibration (4 min):</strong> Attacker walks at various speeds toward goal. GK advances to match — not too fast (gets lobbed) not too slow (leaves big target). Find the right advance speed.' },
      { text: '<strong>Controlled 1v1 (10 min):</strong> Attacker receives ball at 40m and drives at goal. GK must advance to cut angle, get body low, and force the attacker one side. No reckless diving. 10 reps, 3 attackers rotating.' },
      { text: '<strong>Force + Save (6 min):</strong> GK focuses on forcing the shot to the weak side (GK\'s strong diving side). Attacker is allowed to shoot — GK saves or blocks.' }
    ],
    coachingCues: ['"Advance — don\'t retreat!"', '"Stay big — arms wide, body low!"', '"Force them to the side — don\'t let them pick their spot!"', '"Don\'t dive early — wait for the shot!"'],
    progressions: [
      { level: 'Easier', text: 'Attacker must shoot from outside 14m — gives GK more time to set.' },
      { level: 'Standard', text: 'Attacker can drive as close as 5m before shooting.' },
      { level: 'Harder', text: 'Attacker has option to pass to a second attacker appearing late. GK must save the 1v1 OR recover to cover the pass.' }
    ],
    safety: 'No slide tackles or dangerous challenges. GK must stay on feet unless committing to a full block save. Ensure ground is dry before GK dive-block practice.',
    successCriteria: [
      'GK advances to the correct distance — ball visible to both sides of goal minimised.',
      'Attacker is forced to the side on 7/10 reps.',
      'GK stays on feet for 3+ seconds before committing — not diving early.'
    ],
    diagram: { gk: {x:50,y:22}, defenders: [], attackers: [{x:50,y:75,label:'A'}], cones: [] }
  },

  {
    id: 'bk-02', category: '1v1 & Breakaway', categoryIcon: '⚡',
    sport: 'Both', ageGroup: 'Senior', difficulty: 'Harder',
    title: 'The Brave Block',
    subtitle: 'Feet-first and body block techniques for close-range saves',
    duration: '20 mins', players: '2–4', space: 'Goal Area',
    objective: [
      { icon: '💪', text: 'Commit bravely to a body block when the attacker is too close to dive wide.' },
      { icon: '🛡️', text: 'Use the correct technique — spread the body, head back, protect face.' },
      { icon: '🧠', text: 'Make the block at the right moment — not too early (dive past) not too late.' }
    ],
    equipment: ['Goal', '15 sliotars', '2 attackers', 'Bibs', 'GK gloves and protection'],
    phases: [
      { text: '<strong>Block Technique (4 min):</strong> Coach demonstrates the block — body spreads wide (arms and legs), head pulled back, core tight. GK practises without ball in slow motion × 10.' },
      { text: '<strong>Slow Breakaway Block (10 min):</strong> Attacker approaches slowly and shoots at low pace. GK spreads to block. Attacker gradually increases pace over 10 reps per pair.' },
      { text: '<strong>Live Block (6 min):</strong> Attacker breaks from 25m at full pace. GK advances, jockeys, and commits to the block at the right moment. Judge success by whether block diverts ball wide or over.' }
    ],
    coachingCues: ['"Spread wide — take up every inch of that goal!"', '"Head back — ball must hit your body, not your face!"', '"Time it — don\'t commit until they\'re committed!"', '"Be brave — hesitation is the real danger!"'],
    progressions: [
      { level: 'Easier', text: 'Attacker shoots from a standing position. GK practises block without forward motion.' },
      { level: 'Standard', text: 'Attacker runs in at moderate pace.' },
      { level: 'Harder', text: 'Attacker at full speed; GK has no advance warning of which side to commit to.' }
    ],
    safety: 'GK must wear hand protection, padded shorts, and helmet for this drill. Shot pace should be controlled until technique is correct. Do not allow full-speed blocks until the GK has demonstrated correct head/face position.',
    successCriteria: [
      'GK spreads body to maximum width on every block attempt.',
      'Head is pulled back — ball contacts body, not face.',
      'Block diverts ball wide or over the bar in 6/10 live reps.'
    ],
    diagram: { gk: {x:50,y:15}, defenders: [], attackers: [{x:50,y:65,label:'A'}], cones: [] }
  },

  {
    id: 'bk-03', category: '1v1 & Breakaway', categoryIcon: '⚡',
    sport: 'Both', ageGroup: 'U16', difficulty: 'Standard',
    title: 'The Jockey Drill',
    subtitle: 'Staying on feet and delaying the attacker',
    duration: '18 mins', players: '2–3', space: 'Goal Area',
    objective: [
      { icon: '🦶', text: 'Stay on feet as long as possible in a 1v1 — never dive early.' },
      { icon: '⏰', text: 'Delay the attacker for maximum time to allow defenders to recover.' },
      { icon: '🧠', text: 'Force a poor shot by staying up and narrowing the window.' }
    ],
    equipment: ['Goal', '12 sliotars', '2–3 attackers', 'Bibs'],
    phases: [
      { text: '<strong>Slow Jockey (5 min):</strong> Attacker dribbles slowly at goal. GK advances slowly, staying in front, mirroring movement. Attacker tries to go around — GK cuts them off without diving. No shooting yet.' },
      { text: '<strong>Jockey + Force (8 min):</strong> Attacker allowed to shoot. GK must stay on feet for 4+ seconds before committing. If GK dives before 4 seconds — rep does not count. Trains patience.' },
      { text: '<strong>Defender Recovery (5 min):</strong> Coach times how long GK can hold the attacker before shooting. Defender starts 15m behind. GK must hold attacker long enough for defender to arrive. Succeeds if defender touches attacker before the shot.' }
    ],
    coachingCues: ['"Stay up — DON\'T DIVE!"', '"Small steps — always adjusting!"', '"You buy time — they make the mistake!"', '"Even if they score — staying up was right. Don\'t punish good technique."'],
    progressions: [
      { level: 'Easier', text: 'Attacker must wait 5 seconds before shooting — GK learns patient footwork.' },
      { level: 'Standard', text: 'Attacker can shoot at will after 3 seconds.' },
      { level: 'Harder', text: 'Second attacker appears 5 seconds in — GK must decide whether to commit or continue jockeying.' }
    ],
    safety: 'No full-speed close-range shooting until GK demonstrates correct jockeying form. Ensure no collision between GK and attacker — jockeying only, no physical contact.',
    successCriteria: [
      'GK stays on feet for 4+ seconds in 8/10 reps.',
      'Attacker is forced to shoot from a sub-optimal angle in most reps.',
      'GK allows defender to arrive before the shot in the recovery drill 5+/10 times.'
    ],
    diagram: { gk: {x:50,y:20}, defenders: [], attackers: [{x:50,y:65,label:'A'}], cones: [] }
  },

  {
    id: 'bk-04', category: '1v1 & Breakaway', categoryIcon: '⚡',
    sport: 'Both', ageGroup: 'Senior', difficulty: 'Harder',
    title: 'The Last Line',
    subtitle: 'Full match-speed 1v1 breakaway scenarios',
    duration: '25 mins', players: '5–8', space: 'Full Half Pitch',
    objective: [
      { icon: '🔥', text: 'Experience and manage full-pace 1v1 breakaways in a competitive environment.' },
      { icon: '🧠', text: 'Apply all 1v1 skills — advance, jockey, block — in the correct situation.' },
      { icon: '💪', text: 'Build confidence in the most high-pressure goalkeeping scenario.' }
    ],
    equipment: ['Full-size goal', '20+ sliotars', '4–6 attackers', '2 defenders', 'Bibs'],
    phases: [
      { text: '<strong>Gate Release (10 min):</strong> Attacker starts at 45m. GK shouts "Go!" — attacker sprints at goal. GK must make the correct 1v1 decision. Rotate 4 attackers, 15 reps total.' },
      { text: '<strong>Chased Breakaway (10 min):</strong> Attacker AND defender race from the halfway. If attacker gets clear — 1v1 with GK. If defender catches — pass back and puck out. GK must also read whether to come out or hold.' },
      { text: '<strong>Competition (5 min):</strong> GK tracks saves/concedes. Target: save or cause miss in 5/10 breakaways.' }
    ],
    coachingCues: ['"Assess: can they shoot from there? Come out!"', '"If the defender is close — hold the line!"', '"You have power — use it. Come out BIG!"', '"Don\'t let them pick their spot — take the decision away from them!"'],
    progressions: [
      { level: 'Easier', text: 'Attacker starts at 20m — limited run-up. GK has more time to set.' },
      { level: 'Standard', text: 'Attacker from 45m — full breakaway pace.' },
      { level: 'Harder', text: 'Two attackers, one defender — GK must choose: come out on the ball carrier or hold for the pass?' }
    ],
    safety: 'Full pace drill — ensure GK is fully warmed up and has practiced technique at slower speed first. No dangerous tackles or body charges from attackers.',
    successCriteria: [
      'GK makes correct decision (advance vs. hold) in 8/10 reps.',
      'GK saves or forces a miss in 5+ of 10 competitive reps.',
      'GK does not panic — stays composed even after conceding.'
    ],
    diagram: { gk: {x:50,y:12}, defenders: [{x:60,y:65,label:'D'}], attackers: [{x:50,y:70,label:'A'}], cones: [] }
  },

  {
    id: 'bk-05', category: '1v1 & Breakaway', categoryIcon: '⚡',
    sport: 'Camogie', ageGroup: 'U16', difficulty: 'Standard',
    title: 'The Slide Block',
    subtitle: 'Executing the slide/smother block at close range',
    duration: '20 mins', players: '2–3', space: 'Goal Area',
    objective: [
      { icon: '🛡️', text: 'Master the technique for a controlled feet-first slide block on a ball carrier.' },
      { icon: '⚡', text: 'Time the slide correctly — neither too early nor after the shot.' },
      { icon: '💪', text: 'Protect the GK\'s body while maximising the blocking surface area.' }
    ],
    equipment: ['Goal', 'Soft gym mat for practice phase', '12 sliotars', 'Bibs', 'Padded shorts'],
    phases: [
      { text: '<strong>Mat Technique (5 min):</strong> On a mat, GK practises the slide — lead foot extends, body follows, arms spread wide, head to the side. 10 slow reps with no ball.' },
      { text: '<strong>Slow Ball Slide (8 min):</strong> Attacker rolls ball slowly toward goal — GK slides to block. Focus on correct timing: slide as ball is about to be struck, not before.' },
      { text: '<strong>Live Slide (7 min):</strong> Attacker drives at moderate pace and shoots low. GK must jockey then commit to the slide block at the right moment.' }
    ],
    coachingCues: ['"Feet first — lead with the foot, not the head!"', '"Timing is everything — wait, wait, NOW!"', '"Spread the body wide — bigger is better!"', '"After the block — get up! It may rebound!"'],
    progressions: [
      { level: 'Easier', text: 'Attacker shoots from a standstill — GK has time to prepare slide position.' },
      { level: 'Standard', text: 'Attacker at jogging pace — realistic timing challenge.' },
      { level: 'Harder', text: 'Attacker feints before shooting — GK must hold the slide until actual shot, not the dummy.' }
    ],
    safety: 'Padded shorts are essential for repeated slide work. Practice on soft ground only — no concrete or hard surfaces. Helmets on at all times. No head-first diving allowed.',
    successCriteria: [
      'Slide technique is controlled and low — not a crash fall.',
      'Body is spread to maximum width on every slide.',
      'GK correctly times 6/10 slides — not too early or too late.'
    ],
    diagram: { gk: {x:50,y:12}, defenders: [], attackers: [{x:50,y:55,label:'A'}], cones: [] }
  },

  {
    id: 'bk-06', category: '1v1 & Breakaway', categoryIcon: '⚡',
    sport: 'Both', ageGroup: 'Senior', difficulty: 'Standard',
    title: 'Reading Body Shape',
    subtitle: 'Predicting shot direction from attacker cues',
    duration: '18 mins', players: '2–3', space: 'Goal Area + 20m',
    objective: [
      { icon: '👀', text: 'Identify directional cues — shoulder drop, plant foot, hip angle — before the shot is struck.' },
      { icon: '🧠', text: 'Make a pre-shot commitment based on reading, not reacting.' },
      { icon: '⚡', text: 'Combine body-reading with the correct blocking/saving technique.' }
    ],
    equipment: ['Goal', '15 sliotars', '2 shooters', 'Video camera (optional for review)'],
    phases: [
      { text: '<strong>Cue Identification (5 min):</strong> Coach explains the 3 key cues: plant foot direction, shoulder drop side, hip opening. Shooter demonstrates each slowly — GK identifies the cue before the shot.' },
      { text: '<strong>Cue + React (8 min):</strong> Shooter approaches at moderate pace and shoots. GK calls the direction BEFORE the shot is struck based on cues. Track accuracy. 15 reps.' },
      { text: '<strong>Disguise Test (5 min):</strong> Shooter deliberately hides cues or sends a false signal. GK must decide when to trust the cue and when to wait. Tests advanced reading.' }
    ],
    coachingCues: ['"Plant foot points where the ball goes — mostly!"', '"Shoulder drop gives away the dive — watch it!"', '"If you\'re reading right — you\'re early every time!"', '"Trust your read — commit don\'t hesitate!"'],
    progressions: [
      { level: 'Easier', text: 'Shooter tells GK which cue to watch each rep. One cue at a time.' },
      { level: 'Standard', text: 'GK reads any cue available. No hints.' },
      { level: 'Harder', text: 'Shooter deliberately masks all cues — purely reactive saving.' }
    ],
    safety: 'No specific safety concerns for this drill. Ensure GK is warmed up before diving practice.',
    successCriteria: [
      'GK correctly calls direction before the shot in 6/10 cue-reading reps.',
      'GK can identify and name the specific cue they used in the debrief.',
      'Response time from shot to save is visibly faster than reaction-only saving.'
    ],
    diagram: { gk: {x:50,y:12}, defenders: [], attackers: [{x:50,y:55,label:'A'}], cones: [] }
  },

  {
    id: 'bk-07', category: '1v1 & Breakaway', categoryIcon: '⚡',
    sport: 'Both', ageGroup: 'U14', difficulty: 'Easier',
    title: 'Two-Step Engagement',
    subtitle: 'Safe advancing technique for young GKs',
    duration: '15 mins', players: '2–4', space: 'Goal Area + 20m',
    objective: [
      { icon: '🦶', text: 'Learn the two-step advance — come off the line safely in a 1v1 situation.' },
      { icon: '📐', text: 'Understand that coming off the line reduces the shooter\'s angle.' },
      { icon: '🧠', text: 'Build confidence to advance off the line — not just stand on the goal line.' }
    ],
    equipment: ['Goal', '2 cones at 3m and 7m from goal line', '10 sliotars', 'Attacker'],
    phases: [
      { text: '<strong>Distance Markers (3 min):</strong> Place cones at 3m and 7m from goal line. Show GK: "Cone 1 = narrow angle. Cone 2 = very narrow but risk of lob." Demonstrate with a string to show angle reduction.' },
      { text: '<strong>Two-Step Advance (7 min):</strong> Attacker approaches slowly. GK takes exactly 2 steps forward (to cone 1) and sets. Attacker shoots from 15m. GK makes the save from cone 1 position. Repeat 15 reps.' },
      { text: '<strong>Decision Advance (5 min):</strong> GK now decides — 1 step or 2 steps — based on how close the attacker is. Builds judgment.' }
    ],
    coachingCues: ['"Come off the line — you\'re hiding the goal!"', '"Two steps and SET — don\'t keep running!"', '"If they\'re far — 2 steps. If they\'re close — hold!"', '"BIG body — arms wide at the right position!"'],
    progressions: [
      { level: 'Easier', text: 'GK always advances to cone 1. No decision required.' },
      { level: 'Standard', text: 'GK decides between cone 1 and cone 2 based on attacker position.' },
      { level: 'Harder', text: 'GK advances without cones — must judge position independently.' }
    ],
    safety: 'U14 sessions: No attacker at full pace until GK has confidence. Start all 1v1s with attacker at a jogging pace. No shooting from inside 8m for U14.',
    successCriteria: [
      'GK advances off the goal line in every rep — no standing on the line.',
      'GK sets before the shot in 8/10 reps.',
      'GK correctly identifies "too far" — stops before being lobbed.'
    ],
    diagram: { gk: {x:50,y:18}, defenders: [], attackers: [{x:50,y:70,label:'A'}], cones: [{x:50,y:12},{x:50,y:22}] }
  },

  {
    id: 'bk-08', category: '1v1 & Breakaway', categoryIcon: '⚡',
    sport: 'Both', ageGroup: 'Senior', difficulty: 'Standard',
    title: 'Rebound Fight',
    subtitle: 'Winning second balls in a crowded goal area',
    duration: '18 mins', players: '3–5', space: 'Goal Area',
    objective: [
      { icon: '💪', text: 'Win second balls after a save or a striker\'s shot hits the post.' },
      { icon: '⚡', text: 'React instantly to rebounds — never stand still after the first save.' },
      { icon: '📢', text: 'Command the box — call, claim, or clear any loose ball loudly.' }
    ],
    equipment: ['Full-size goal', '15 sliotars', '2–3 strikers', 'Bibs'],
    phases: [
      { text: '<strong>Post Rebound (5 min):</strong> Coach fires ball at the post. GK must be first to react — either catch, punch, or clear. 10 reps from varying distances.' },
      { text: '<strong>Save + Follow Up (8 min):</strong> Striker shoots; GK saves to a specific side. Second striker immediately runs onto the rebound. GK must clear or reclaim before second striker can shoot.' },
      { text: '<strong>Chaos Rebound (5 min):</strong> 3 strikers circling the goal. GK saves or coach deflects — loose ball must be claimed or cleared under maximum crowd pressure.' }
    ],
    coachingCues: ['"NEVER stand still after a save — next ball is coming!"', '"CLEAR or CLAIM — nothing in between!"', '"Use your voice — don\'t let them creep in!"', '"Attack the rebound — it\'s YOUR ball!"'],
    progressions: [
      { level: 'Easier', text: 'One striker only. Rebound is slow and predictable.' },
      { level: 'Standard', text: 'Two strikers. Mixed rebound directions.' },
      { level: 'Harder', text: 'Three strikers. GK must deal with 2 consecutive shots in 3 seconds.' }
    ],
    safety: 'Crowded goal area requires clear rules — no player may tackle the GK while they hold the ball. Strikers challenge for the ball, not the person.',
    successCriteria: [
      'GK clears or claims every rebound within 2 seconds of it arising.',
      'No second-chance goals from rebounds GK has touched.',
      'GK uses voice to command the area on every rebound situation.'
    ],
    diagram: { gk: {x:50,y:12}, defenders: [], attackers: [{x:35,y:40,label:'A'},{x:50,y:45,label:'A'},{x:65,y:40,label:'A'}], cones: [] }
  },

  {
    id: 'bk-09', category: '1v1 & Breakaway', categoryIcon: '⚡',
    sport: 'Both', ageGroup: 'Senior', difficulty: 'Harder',
    title: 'The 2v1 Response',
    subtitle: 'Managing two attackers with one defender support',
    duration: '22 mins', players: '4–6', space: 'Half Pitch',
    objective: [
      { icon: '🧠', text: 'Decide in real time whether to advance on the ball carrier or hold for the pass.' },
      { icon: '📐', text: 'Position to give the covering defender the best chance to intercept the pass.' },
      { icon: '💪', text: 'Handle a 2v1 situation without panicking — structured decision making.' }
    ],
    equipment: ['Full-size goal', '20+ sliotars', '2 attackers', '1 defender', 'Bibs'],
    phases: [
      { text: '<strong>Whiteboard Talk (3 min):</strong> Coach draws the 2v1 scenario and explains GK options: (1) hold and cover far post, (2) advance on the ball and trust the defender.' },
      { text: '<strong>Slow 2v1 (10 min):</strong> Two attackers advance at jogging pace with one defender. GK makes the decision. 10 reps with debrief after each — was the decision right?' },
      { text: '<strong>Live 2v1 (9 min):</strong> Full pace. GK must decide and execute in real time. Track outcomes: goal / save / forced poor shot.' }
    ],
    coachingCues: ['"If the ball carrier is about to shoot — advance. If they\'re passing — hold!"', '"Watch the ball carrier\'s eyes — do they see the pass option?"', '"Cover the far post — that\'s the danger zone!"', '"Talk to your defender — tell them which side to cover!"'],
    progressions: [
      { level: 'Easier', text: 'Attackers slow — GK has time to decide.' },
      { level: 'Standard', text: 'Realistic pace as described.' },
      { level: 'Harder', text: '3v1 — extra attacker increases the passing options the GK must consider.' }
    ],
    safety: 'Full speed drill — ensure all players warmed up. No physical challenges on the GK when they advance from the line.',
    successCriteria: [
      'GK makes correct advance/hold decision in 7/10 reps.',
      'No easy goals from the far post when GK advances incorrectly.',
      'GK communicates with the defender throughout every rep.'
    ],
    diagram: { gk: {x:50,y:12}, defenders: [{x:65,y:60,label:'D'}], attackers: [{x:40,y:60,label:'A'},{x:60,y:55,label:'A'}], cones: [] }
  },

  {
    id: 'bk-10', category: '1v1 & Breakaway', categoryIcon: '⚡',
    sport: 'Both', ageGroup: 'U16', difficulty: 'Standard',
    title: 'Hesitation Save',
    subtitle: 'Holding the set position against a feinting attacker',
    duration: '18 mins', players: '2–4', space: 'Goal Area',
    objective: [
      { icon: '🧠', text: 'Hold position and not commit to a feint during a 1v1 — wait for the real shot.' },
      { icon: '🦶', text: 'Maintain a balanced set position even when the attacker hesitates or dummies.' },
      { icon: '💪', text: 'Build the mental discipline to "read" a real shot from a dummy.' }
    ],
    equipment: ['Goal', '12 sliotars', '2–3 attackers', 'Bibs'],
    phases: [
      { text: '<strong>Feint Recognition (4 min):</strong> Attacker demonstrates 3 types of dummy: shoulder feint, foot fake, and full body shuffle. GK watches in slow motion and identifies each without reacting.' },
      { text: '<strong>Hold Your Ground (9 min):</strong> Attacker approaches and either dummies or shoots — randomly. GK earns a point for holding against a dummy or saving a real shot. Loses a point for committing to a dummy.' },
      { text: '<strong>Decision Pressure (5 min):</strong> Attacker can do up to 3 dummies before shooting. GK must stay patient through all 3.' }
    ],
    coachingCues: ['"Wait for the strike — not the wind-up!"', '"Watch the ball, not the body!"', '"Hold, hold, HOLD — then commit!"', '"Getting dummied is not the worst thing — early dive is."'],
    progressions: [
      { level: 'Easier', text: 'Attacker signals before each rep whether it\'s a dummy or real — GK trains the correct response only.' },
      { level: 'Standard', text: 'No signal — GK must read and decide.' },
      { level: 'Harder', text: 'Attacker can change mind mid-approach — feint becomes real, or real becomes feint.' }
    ],
    safety: 'No safety concerns specific to this drill. Ensure ground is clear and GK is warmed up before diving work.',
    successCriteria: [
      'GK correctly holds against dummies in 7/10 reps.',
      'GK does not fall for the same dummy twice in a session.',
      'GK saves real shots at normal percentage when they finally arrive.'
    ],
    diagram: { gk: {x:50,y:12}, defenders: [], attackers: [{x:50,y:60,label:'A'}], cones: [] }
  },

  // ═══════════════════════════════════════════════════════════
  //  CATEGORY 6 — COMMUNICATION & ORGANISATION
  // ═══════════════════════════════════════════════════════════

  {
    id: 'co-01', category: 'Communication & Organisation', categoryIcon: '📢',
    sport: 'Both', ageGroup: 'Senior', difficulty: 'Standard',
    title: 'The Command Vocabulary',
    subtitle: 'Learning and applying the 8 essential GK commands',
    duration: '20 mins', players: '6–12', space: 'Half Pitch',
    objective: [
      { icon: '📢', text: 'Establish a clear set of commands that all defenders understand immediately.' },
      { icon: '🗣️', text: 'Use commands at the right moment — not too early, not too late.' },
      { icon: '🧠', text: 'Build habits so commands come automatically in match pressure.' }
    ],
    equipment: ['Half pitch', 'Full squad (including defenders)', 'No ball for part 1'],
    phases: [
      { text: '<strong>Command Vocabulary (4 min):</strong> Coach introduces 8 commands: "Keeper!" (GK\'s ball), "Away!" (punch it clear), "Time!" (you have time to look), "Press!" (close the carrier), "Drop!" (fall back), "Left/Right!" (shift the line), "Hold!" (don\'t commit), "Man on!" (opponent behind you).' },
      { text: '<strong>Scenario Flash (10 min):</strong> Coach describes a scenario — GK must call the correct command. 20 scenarios in rapid succession. Defenders react to commands and coach checks their response.' },
      { text: '<strong>Live Drill (6 min):</strong> Small-sided game — GK must use at least 3 different commands in each 2-minute round. Any missed communication is flagged.' }
    ],
    coachingCues: ['"Loud, clear, early — every time!"', '"One command — don\'t shout three things at once!"', '"If you\'re not talking — you\'re not leading!"', '"Your defenders trust your voice — use it!"'],
    progressions: [
      { level: 'Easier', text: 'Reduce to 4 commands only (Keeper, Away, Press, Drop).' },
      { level: 'Standard', text: 'All 8 commands as described.' },
      { level: 'Harder', text: 'GK must use commands while performing saves simultaneously — no pausing to communicate.' }
    ],
    safety: 'No safety concerns. Drill can be conducted without a ball in the learning phase.',
    successCriteria: [
      'GK uses correct command in 9/10 scenario flashes.',
      'Defenders react correctly to commands in the live drill.',
      'GK uses at least 3 different commands in every 2-minute live round.'
    ],
    diagram: { gk: {x:50,y:12}, defenders: [{x:20,y:35,label:'D'},{x:40,y:30,label:'D'},{x:60,y:30,label:'D'},{x:80,y:35,label:'D'}], attackers: [{x:30,y:65,label:'A'},{x:50,y:70,label:'A'},{x:70,y:65,label:'A'}], cones: [] }
  },

  {
    id: 'co-02', category: 'Communication & Organisation', categoryIcon: '📢',
    sport: 'Both', ageGroup: 'Senior', difficulty: 'Standard',
    title: 'Corner Kick Organisation',
    subtitle: 'Organising the defence and claiming corners',
    duration: '20 mins', players: '8–12', space: 'Goal Area + Corner',
    objective: [
      { icon: '📐', text: 'Set up a corner-kick defensive shape before the ball is struck.' },
      { icon: '🗣️', text: 'Communicate defender positions clearly and quickly under time pressure.' },
      { icon: '🙌', text: 'Claim or punch the corner ball effectively from a set position.' }
    ],
    equipment: ['Full-size goal', '6 defenders', '4 attackers', '12 sliotars', 'Bibs'],
    phases: [
      { text: '<strong>Shape Setup (4 min):</strong> GK organises defenders into the standard corner setup: 2 on posts, 2 zonal in the 6-yard box, 2 man-marking key attackers. GK talks them into position.' },
      { text: '<strong>Live Corner (12 min):</strong> Ball delivered from corner. GK calls "Keeper!" for balls they can claim; "Away!" for balls defenders must punch. 15 corners alternating left and right.' },
      { text: '<strong>Chaos Corner (4 min):</strong> Attackers don\'t hold positions — they make late runs. GK must adapt the shape and communicate new assignments in real time.' }
    ],
    coachingCues: ['"Post first — then organise the rest!"', '"Loud and specific — not just shouting names!"', '"If you\'re coming for it — call EARLY!"', '"Own the 6-yard box — it belongs to you!"'],
    progressions: [
      { level: 'Easier', text: 'Static attackers — defenders assigned to zones only, no man-marking.' },
      { level: 'Standard', text: 'Mix of zone and man-marking. Attackers move before the ball is struck.' },
      { level: 'Harder', text: 'Attackers make run-throughs — defenders must track. GK must update marks mid-organisation.' }
    ],
    safety: 'Aerial challenges in the box — enforce heading or catching rules strictly for U14/U16. No elbowing or barging. GK must call before going for the ball to avoid collisions with defenders.',
    successCriteria: [
      'GK organises all 6 defenders before the corner is taken in 8/10 reps.',
      'GK claims or punches 8/15 corner deliveries clean.',
      'No conceded goals from corners that were set up correctly.'
    ],
    diagram: { gk: {x:50,y:12}, defenders: [{x:18,y:12,label:'D'},{x:82,y:12,label:'D'},{x:35,y:20,label:'D'},{x:65,y:20,label:'D'},{x:30,y:35,label:'D'},{x:70,y:35,label:'D'}], attackers: [{x:25,y:45,label:'A'},{x:50,y:40,label:'A'},{x:75,y:45,label:'A'}], cones: [] }
  },

  {
    id: 'co-03', category: 'Communication & Organisation', categoryIcon: '📢',
    sport: 'Both', ageGroup: 'U16', difficulty: 'Standard',
    title: 'Setting the Back Line',
    subtitle: 'Organising the defensive line depth and shape',
    duration: '20 mins', players: '6–10', space: 'Half Pitch',
    objective: [
      { icon: '📐', text: 'Communicate the correct back-line depth for each game situation.' },
      { icon: '🗣️', text: 'Push the back line up after a turnover, and drop it when defending deep.' },
      { icon: '🧠', text: 'Coordinate the line so all 4 defenders move simultaneously on the GK\'s call.' }
    ],
    equipment: ['Half pitch', '4 defenders', '3 attackers', 'Bibs', 'Cones for line reference'],
    phases: [
      { text: '<strong>Line Positions (4 min):</strong> GK and coach discuss three line depths: High line (45m), Standard (30m), Deep (21m). Defenders walk through each on command: "Push up!" / "Hold!" / "Drop!"' },
      { text: '<strong>Reactive Line (10 min):</strong> Attackers move and the team needs to shift line depth. GK reads the situation and calls the correct line instruction. Defenders react immediately. Coach evaluates correctness.' },
      { text: '<strong>Transition Line (6 min):</strong> Team transitions from attack to defence. GK must immediately call the correct line depth based on how many attackers are in front of the ball when possession is lost.' }
    ],
    coachingCues: ['"Push up — don\'t let them breathe!"', '"Hold the line — one step back and you gift them the space!"', '"All four together — one steps up, all step up!"', '"Loud and clear — they need to hear you from 40m!"'],
    progressions: [
      { level: 'Easier', text: 'Coach tells GK which line depth to call — GK practices the communication only.' },
      { level: 'Standard', text: 'GK decides independently which line depth is correct.' },
      { level: 'Harder', text: 'Line must shift 3 times in 20 seconds — GK calls each shift while also tracking the ball.' }
    ],
    safety: 'No safety concerns specific to this drill. Players must be aware of the offside trap concept — brief all players before beginning.',
    successCriteria: [
      'Defenders all move simultaneously on the GK\'s call — no individuals missing the instruction.',
      'GK selects the correct line depth in 7/10 reactive situations.',
      'Back line is correctly organised within 5 seconds of a turnover.'
    ],
    diagram: { gk: {x:50,y:12}, defenders: [{x:20,y:38,label:'D'},{x:40,y:35,label:'D'},{x:60,y:35,label:'D'},{x:80,y:38,label:'D'}], attackers: [{x:30,y:60,label:'A'},{x:50,y:65,label:'A'},{x:70,y:60,label:'A'}], cones: [] }
  },

  {
    id: 'co-04', category: 'Communication & Organisation', categoryIcon: '📢',
    sport: 'Both', ageGroup: 'Senior', difficulty: 'Standard',
    title: 'The Press Call',
    subtitle: 'Coordinating the defensive press from the GK',
    duration: '18 mins', players: '6–10', space: 'Half Pitch',
    objective: [
      { icon: '📢', text: 'Trigger and coordinate a press from the back-line on GK\'s call.' },
      { icon: '🧠', text: 'Identify the correct moment to press — when the ball carrier is isolated and slow.' },
      { icon: '🗣️', text: 'Call off the press when it is not working — prevent being exploited.' }
    ],
    equipment: ['Half pitch', '4 defenders', '3 attackers', '10 sliotars', 'Bibs'],
    phases: [
      { text: '<strong>Press Triggers (4 min):</strong> Coach identifies 4 triggers: poor ball control, back foot, isolated carrier, slow delivery. GK learns to spot them and call "Press!" only when 2+ triggers are present.' },
      { text: '<strong>Call the Press (10 min):</strong> Small-sided game. GK calls "Press!" when triggers appear. Defenders press. GK calls "Drop!" if press is broken. Coach evaluates correctness of calls.' },
      { text: '<strong>Counter-Press Drill (4 min):</strong> After a press wins the ball, GK immediately directs the transition: "Go right!" / "Go long!" Combines press call with fast break instruction.' }
    ],
    coachingCues: ['"Wrong time to press = easy goal — wait for the trigger!"', '"Press is a team call — you need everyone!"', '"If it\'s broken — say drop and RESET!"', '"Win the ball — then direct it fast!"'],
    progressions: [
      { level: 'Easier', text: 'Coach signals when to press — GK relays the call. Builds communication habit.' },
      { level: 'Standard', text: 'GK identifies and calls independently.' },
      { level: 'Harder', text: 'Attackers adapt — they hold the ball longer when they see the press preparing. GK must wait or abandon call.' }
    ],
    safety: 'Press drill should involve controlled pressure only — no physical challenges during the drill phase.',
    successCriteria: [
      'GK correctly identifies a press opportunity in 6/10 reps.',
      'Defenders respond to "Press!" within 1 second in 8/10 calls.',
      'GK successfully calls off a failed press before it is exploited at least 3 times per round.'
    ],
    diagram: { gk: {x:50,y:12}, defenders: [{x:20,y:40,label:'D'},{x:40,y:35,label:'D'},{x:60,y:35,label:'D'},{x:80,y:40,label:'D'}], attackers: [{x:50,y:65,label:'A'},{x:30,y:60,label:'A'},{x:70,y:60,label:'A'}], cones: [] }
  },

  {
    id: 'co-05', category: 'Communication & Organisation', categoryIcon: '📢',
    sport: 'Both', ageGroup: 'Senior', difficulty: 'Harder',
    title: 'Wall Organisation',
    subtitle: 'Building and managing a defensive wall for frees',
    duration: '18 mins', players: '5–8', space: 'Goal Area',
    objective: [
      { icon: '📐', text: 'Correctly position a defensive wall to protect the near post from a free.' },
      { icon: '🗣️', text: 'Set the wall quickly and position the last player to give GK a clear sightline.' },
      { icon: '👀', text: 'Read the shooter\'s run-up while managing the wall simultaneously.' }
    ],
    equipment: ['Full-size goal', '10 sliotars', '3–5 players for the wall', 'Cones to mark free position'],
    phases: [
      { text: '<strong>Wall Theory (4 min):</strong> Coach explains the wall-setting rules: GK stands on the far-post side; wall covers near-post; last player in wall is used as reference point. GK\'s job: point to the last player\'s position and watch the sightline.' },
      { text: '<strong>Wall Practice (9 min):</strong> Free from various positions (30m, 45° left, 45° right). GK sets the wall each time. Shooter takes the free after wall is set — GK saves to the far side.' },
      { text: '<strong>Speed Wall (5 min):</strong> Wall must be set within 10 seconds of the free being awarded. Coach counts aloud. If not set in time, free is taken anyway — simulates a quick free.' }
    ],
    coachingCues: ['"You set the last man — not the front man!"', '"Check your sightline — can you see the ball?"', '"Tell them exactly where to stand — don\'t wave your arms!"', '"Lock in on the ball once the wall is set — don\'t fidget!"'],
    progressions: [
      { level: 'Easier', text: 'Wall pre-set by coach — GK focuses only on saving the shot.' },
      { level: 'Standard', text: 'GK sets wall and then makes the save.' },
      { level: 'Harder', text: 'Player tries to break through or go around the wall — GK must realign and save.' }
    ],
    safety: 'Players in the wall must protect their face and body when the free is taken — hands clasped over face and body square on. No children under 12 in a wall for powerful direct frees.',
    successCriteria: [
      'Wall covers the near post correctly in 8/10 setups.',
      'GK has a clear sightline to the ball in 8/10 setups.',
      'Wall is set within 10 seconds in 7/10 reps in the speed wall phase.'
    ],
    diagram: { gk: {x:70,y:12}, defenders: [{x:42,y:18,label:'W'},{x:48,y:18,label:'W'},{x:54,y:18,label:'W'}], attackers: [{x:30,y:55,label:'F'}], cones: [] }
  },

  {
    id: 'co-06', category: 'Communication & Organisation', categoryIcon: '📢',
    sport: 'Both', ageGroup: 'U16', difficulty: 'Standard',
    title: 'Blind Trust Communication',
    subtitle: 'Defenders commit fully to GK calls without looking back',
    duration: '18 mins', players: '4–8', space: 'Half Pitch',
    objective: [
      { icon: '🤝', text: 'Build trust between GK and defenders — defenders act on calls without hesitation.' },
      { icon: '🗣️', text: 'GK must earn trust through clear, accurate, early calls.' },
      { icon: '🧠', text: 'Develop the habit of defenders listening first, then looking.' }
    ],
    equipment: ['Half pitch', '3 defenders', '3 attackers', 'Bibs'],
    phases: [
      { text: '<strong>Trust Contract (3 min):</strong> Verbal agreement with defenders: "If I call Press — you press. If I call Drop — you drop. No hesitation, no second-guessing. If I\'m wrong, I\'ll own it."' },
      { text: '<strong>Blindfold Direction (8 min):</strong> Defenders face away from the play. GK calls their name + direction. They must move before turning. Tests purity of communication. No ball yet.' },
      { text: '<strong>Live Trust (7 min):</strong> Normal play. Defenders must act on calls within 1 second — before they fully process the situation. If they hesitate, pause play and discuss.' }
    ],
    coachingCues: ['"Trust is earned — by calling right every time!"', '"Defender: move first, look second!"', '"GK: you must call early — they need 1 second to react!"', '"This is built in training — it\'s automatic in a match."'],
    progressions: [
      { level: 'Easier', text: 'Slow play — defenders have 2 seconds to respond to calls.' },
      { level: 'Standard', text: 'Normal pace — 1-second response expected.' },
      { level: 'Harder', text: 'GK communicates only using visual signals (arm pointing) — no voice. Defenders must watch the GK.' }
    ],
    safety: 'Blindfold phase must be done in an open area with no obstacles. Ensure defenders walking backward have a clear path.',
    successCriteria: [
      'Defenders respond to calls within 1 second in 8/10 reps.',
      'GK calls are accurate — defenders trust correctly 7/10 times.',
      'Trust drill produces visibly tighter defensive organisation in the live phase.'
    ],
    diagram: { gk: {x:50,y:12}, defenders: [{x:25,y:40,label:'D'},{x:50,y:38,label:'D'},{x:75,y:40,label:'D'}], attackers: [{x:30,y:65,label:'A'},{x:50,y:70,label:'A'},{x:70,y:65,label:'A'}], cones: [] }
  },

  {
    id: 'co-07', category: 'Communication & Organisation', categoryIcon: '📢',
    sport: 'Both', ageGroup: 'Senior', difficulty: 'Harder',
    title: 'The Reset Protocol',
    subtitle: 'Reorganising the defence within 5 seconds of conceding',
    duration: '18 mins', players: '6–10', space: 'Half Pitch',
    objective: [
      { icon: '🔁', text: 'Reset the defensive shape within 5 seconds of conceding a point or goal.' },
      { icon: '📢', text: 'GK leads the verbal reset — immediate call after the score.' },
      { icon: '🧠', text: 'Prevent the concession of a second consecutive score due to disorganisation.' }
    ],
    equipment: ['Full-size goal', '6 defenders', '5 attackers', '20+ sliotars', 'Bibs'],
    phases: [
      { text: '<strong>Score + Reset (8 min):</strong> Attackers score. GK immediately shouts: "Reset! Left, centre, right — positions!" Defenders sprint to positions. GK pucks out within 5 seconds of the score. If 5 seconds passes without reset — attackers get a free shot.' },
      { text: '<strong>Pressure Resets (6 min):</strong> Attackers score 3 in a row. After each, GK leads the reset. Tests consistency and composure after repeated concessions.' },
      { text: '<strong>Timed Competition (4 min):</strong> Coach times the reset from moment of score to GK completing puckout. Target: under 4 seconds.' }
    ],
    coachingCues: ['"Score doesn\'t matter — reset DOES!"', '"Call it before the sliotar hits the net — be ahead!"', '"Every defender needs to hear their name or position!"', '"Quick reset = less time for the opposition to celebrate and press."'],
    progressions: [
      { level: 'Easier', text: '10-second window for reset. Defenders walk to positions.' },
      { level: 'Standard', text: '5-second window. Defenders sprint.' },
      { level: 'Harder', text: '3-second window. Attackers immediately press after scoring — GK must reset under physical pressure.' }
    ],
    safety: 'Attackers pressing after a score must not make contact with GK. The press is about closing down puckout options, not tackling the GK.',
    successCriteria: [
      'GK calls the reset within 1 second of the score in 8/10 reps.',
      'All defenders are in position before puckout is taken in 7/10 reps.',
      'No second consecutive goal is conceded in the pressure reset phase due to disorganisation.'
    ],
    diagram: { gk: {x:50,y:12}, defenders: [{x:20,y:35,label:'D'},{x:40,y:30,label:'D'},{x:60,y:30,label:'D'},{x:80,y:35,label:'D'}], attackers: [{x:30,y:55,label:'A'},{x:50,y:60,label:'A'},{x:70,y:55,label:'A'}], cones: [] }
  },

  {
    id: 'co-08', category: 'Communication & Organisation', categoryIcon: '📢',
    sport: 'Both', ageGroup: 'U14', difficulty: 'Easier',
    title: 'The Calling Game',
    subtitle: 'Fun intro to GK communication for younger players',
    duration: '15 mins', players: '4–8', space: 'Goal Area',
    objective: [
      { icon: '📢', text: 'Learn and use the 4 most important GK calls in a fun, low-pressure game.' },
      { icon: '🗣️', text: 'Build confidence in using your voice loudly on a pitch.' },
      { icon: '🤝', text: 'Build team understanding — defenders know what calls mean.' }
    ],
    equipment: ['Goal', '10 sliotars', '4 defenders', 'Coach to referee calls'],
    phases: [
      { text: '<strong>Call Practice (4 min):</strong> Teach 4 calls: "Keeper!" / "Away!" / "Man on!" / "Time!". Each player shouts each call 5 times loudly. Coach checks volume and clarity.' },
      { text: '<strong>Calling Game (8 min):</strong> Small-sided game on the half-pitch. Every correct call earns the GK 1 point. Every missed call loses the GK 1 point. Target: positive score at the end of 8 minutes.' },
      { text: '<strong>Team Challenge (3 min):</strong> If GK makes 5 correct calls in 3 minutes — the team gets a free session activity of their choice (e.g. a fun shooting game).' }
    ],
    coachingCues: ['"Loud voice is a superpower — use it!"', '"No call = problem. Any call = progress!"', '"You\'re the eyes of the team — they\'re counting on your voice!"', '"Every call builds the habit — habits win games!"'],
    progressions: [
      { level: 'Easier', text: '2 calls only (Keeper/Away). Game pace very slow.' },
      { level: 'Standard', text: '4 calls as described.' },
      { level: 'Harder', text: 'Add 2 more calls (Press/Drop). GK must make at least 1 different call per minute.' }
    ],
    safety: 'U14 game should be played at reduced pace. No tackling in the communication focus phases.',
    successCriteria: [
      'GK finishes the calling game with a positive score.',
      'All 4 calls are used at least once in the 8-minute game.',
      'Defenders consistently react to calls correctly — not ignoring them.'
    ],
    diagram: { gk: {x:50,y:12}, defenders: [{x:25,y:38,label:'D'},{x:75,y:38,label:'D'}], attackers: [{x:35,y:60,label:'A'},{x:65,y:60,label:'A'}], cones: [] }
  },

  {
    id: 'co-09', category: 'Communication & Organisation', categoryIcon: '📢',
    sport: 'Both', ageGroup: 'Senior', difficulty: 'Standard',
    title: 'Communication Chaos',
    subtitle: 'Clear GK calls despite noise and confusion',
    duration: '18 mins', players: '6–12', space: 'Half Pitch',
    objective: [
      { icon: '📢', text: 'Deliver clear, specific calls even when crowd noise, multiple players shouting, or distractions are present.' },
      { icon: '🧠', text: 'Develop the mental focus to block out noise and identify the priority communication.' },
      { icon: '💪', text: 'Build vocal stamina — GK voice must carry for 70+ minutes.' }
    ],
    equipment: ['Half pitch', '8–10 players', 'Phone with crowd noise audio (optional)', 'Bibs'],
    phases: [
      { text: '<strong>Noise Introduction (3 min):</strong> All outfield players shout different things simultaneously for 30 seconds. GK must cut through with a single, clear command. Repeat 3 times.' },
      { text: '<strong>Noisy Small-Sided (10 min):</strong> Small-sided game. All attacking players are instructed to shout loudly throughout. GK must still lead defensive organisation clearly. Coach grades call quality (1-3) after each.' },
      { text: '<strong>Vocal Fatigue (5 min):</strong> GK must call loudly and clearly for 5 consecutive minutes of play without dropping volume. If calls become inaudible — coach flags.' }
    ],
    coachingCues: ['"Low and from the chest — not high-pitched and thin!"', '"One clear call beats 5 confused ones!"', '"Block out the noise — find YOUR moment to speak!"', '"A GK who can\'t be heard is a GK who can\'t lead!"'],
    progressions: [
      { level: 'Easier', text: 'No noise added — normal play but GK must commit to loud calls.' },
      { level: 'Standard', text: 'Attacker noise as described.' },
      { level: 'Harder', text: 'Crowd noise audio + attacker noise. GK must maintain clarity throughout.' }
    ],
    safety: 'Vocal warm-up before intense calling drills. GK should hydrate throughout. Stop if GK shows signs of vocal strain.',
    successCriteria: [
      'GK calls are audible across the pitch in 8/10 reps throughout the session.',
      'Defenders react correctly despite background noise — confirming calls are clear.',
      'GK vocal quality does not drop significantly during the vocal fatigue phase.'
    ],
    diagram: { gk: {x:50,y:12}, defenders: [{x:20,y:38,label:'D'},{x:40,y:35,label:'D'},{x:60,y:35,label:'D'},{x:80,y:38,label:'D'}], attackers: [{x:30,y:60,label:'A'},{x:50,y:65,label:'A'},{x:70,y:60,label:'A'}], cones: [] }
  },

  {
    id: 'co-10', category: 'Communication & Organisation', categoryIcon: '📢',
    sport: 'Both', ageGroup: 'Senior', difficulty: 'Standard',
    title: 'The Pre-Game GK Briefing',
    subtitle: 'Simulation of pre-match GK leadership and communication',
    duration: '20 mins', players: '6–10', space: 'Half Pitch',
    objective: [
      { icon: '🧠', text: 'Lead a focused pre-game defensive briefing for the back-line.' },
      { icon: '📢', text: 'Communicate the team\'s defensive shape, triggers, and key opposition threats.' },
      { icon: '🤝', text: 'Build team confidence and collective defensive identity before a match.' }
    ],
    equipment: ['Whiteboard or cones to demonstrate', 'Notes (optional)', 'Full back-line squad'],
    phases: [
      { text: '<strong>Brief Planning (5 min):</strong> GK (with coach support if needed) prepares a 3-point briefing: (1) Our defensive shape, (2) Key opposition threats to neutralise, (3) Our 3 key communication calls for today.' },
      { text: '<strong>Brief Delivery (8 min):</strong> GK delivers the briefing to the back-line. Coach evaluates: clarity, confidence, specific content, eye contact. Defenders can ask 2 clarifying questions.' },
      { text: '<strong>Applied Brief (7 min):</strong> Small-sided game. The 3 calls from the briefing must be used. After the game, check if they matched the briefing.' }
    ],
    coachingCues: ['"Short, clear, specific — not a lecture!"', '"Tell them what THEY need to do — not what you\'re going to do."', '"Confidence in your voice creates confidence in them!"', '"Own it — you\'re the last line of defence AND the first voice of leadership."'],
    progressions: [
      { level: 'Easier', text: 'Coach provides a briefing template — GK fills in the blanks and delivers.' },
      { level: 'Standard', text: 'GK creates and delivers their own briefing as described.' },
      { level: 'Harder', text: 'GK receives new opposition information 2 minutes before the briefing — must adapt quickly and deliver.' }
    ],
    safety: 'No safety concerns for this drill — it is a communication and leadership exercise.',
    successCriteria: [
      'Briefing is delivered in under 3 minutes and covers all 3 areas.',
      'Defenders can recall all 3 key calls after the briefing.',
      'All 3 calls are used in the applied small-sided game.'
    ],
    diagram: { gk: {x:50,y:25}, defenders: [{x:20,y:50,label:'D'},{x:40,y:48,label:'D'},{x:60,y:48,label:'D'},{x:80,y:50,label:'D'}], attackers: [], cones: [] }
  }

];
