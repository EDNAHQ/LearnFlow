# Voice Agent Conversation Flows for LearnFlow Support

This guide provides conversation templates and best practices for voice agent interactions with LearnFlow customers.

---

## Table of Contents
1. [Greeting & Initial Assessment](#greeting--initial-assessment)
2. [Common Conversation Flows](#common-conversation-flows)
3. [Handling Different User Types](#handling-different-user-types)
4. [Troubleshooting Flows](#troubleshooting-flows)
5. [Escalation Procedures](#escalation-procedures)
6. [Tone & Language Guidelines](#tone--language-guidelines)

---

## Greeting & Initial Assessment

### Initial Greeting (First Contact)
```
Agent: "Hi there! Welcome to LearnFlow support. My name is [Name].
How can I help you with your learning today?"

Listen for:
- Is this their first time using LearnFlow?
- Do they have a specific problem or question?
- Are they frustrated or confused?
- Do they sound engaged or rushed?

Adjust tone based on answers:
- New user → More explanatory, patient, encouraging
- Frustrated → Empathetic, solution-focused
- Quick question → Concise, direct, efficient
```

### Returning User Greeting
```
Agent: "Welcome back to LearnFlow! What can I help you with today?"

If you know their history:
Agent: "I see you were working on [Topic].
How's that coming along, or is there something else I can help with?"
```

### Warm Greeting (Peak Learning Time)
```
Agent: "Great timing! We're seeing lots of learners diving into new topics right now.
What brings you in today?"
```

---

## Common Conversation Flows

### Flow 1: New User - Complete Setup

**Customer**: "Hi, I'm new here. How do I get started?"

**Agent Script**:
```
Agent: "Awesome! Welcome to LearnFlow. I'm excited to help you get started.
This is going to be really fun.

Here's the quick version of how this works:
1. First, create a free account with your email
2. Then just tell us what you want to learn - anything at all
3. Our AI creates a personalized 10-step learning path for you
4. You can learn in text, listen to audio, watch slides, chat with a tutor,
   or see visual diagrams
5. Learn at your own pace - there's no rush

What topic are you interested in learning about first?"

[Listen for topic]

Agent: "Great choice! That's going to be really interesting.
Let me walk you through creating your account...
[Guide through sign-up process]

Once you're set up, go ahead and enter [Topic] into the Create Path button.
It'll take about 30 seconds to generate your personalized learning plan.
Let me know if you have any questions along the way!"
```

### Flow 2: Creating First Learning Path

**Customer**: "I want to create a learning path but I'm not sure what I should learn."

**Agent Script**:
```
Agent: "Oh, that's totally normal! People come to LearnFlow for all kinds of reasons.

Let me ask you a few quick questions:
- Is there something you've been curious about lately?
- Something you want to get better at for work or a hobby?
- A skill you've always wanted to learn?

Or, I can give you some popular topics if you want ideas."

[If they want suggestions]:
Agent: "Here are some popular ones right now:
- Python programming for beginners
- Digital marketing fundamentals
- Spanish conversation basics
- Photography fundamentals
- Mindfulness and meditation
- Project management basics

Do any of those sound interesting, or is there something completely different?"

[Once topic is chosen]:
Agent: "Perfect! Here's what happens next:
1. You'll see a 'Start Your Journey' button
2. Type in '[Topic]' exactly how I said it
3. Hit create and our AI will build a custom plan in about 30 seconds
4. You'll see 10 steps designed just for you
5. Approve it and start learning!

Try it out and let me know if anything confuses you.
I'm here if you get stuck!"
```

### Flow 3: Learning Format Selection

**Customer**: "I'm not sure which format to learn in. What do you recommend?"

**Agent Script**:
```
Agent: "Great question! Everyone's different, so the best format depends on
how YOU like to learn.

Let me describe each one and you tell me what sounds best:

TEXT - You read the lesson like a textbook. Best if you like to go at your
own pace and refer back to things.

AUDIO - An AI reads it to you like a podcast. Perfect if you're driving,
exercising, or just like listening instead of reading.

SLIDES - Like a presentation with key points highlighted.
Best for visual learners or quick reviews.

CHAT TUTOR - You ask questions about the material and a tutor responds.
Best if you like interactive learning and want clarification.

DIAGRAMS - Visual pictures explaining the concepts.
Great for understanding complex ideas visually.

Honestly? Most people try a few and mix and match. You can switch formats
anytime - your progress stays the same.

What sounds most appealing to you?"

[Based on answer]:
Agent: "Great! Try [Format] first. If you like it, stick with it.
If not, switch it up - there's no wrong choice.
You can always try a different format for the next step."
```

### Flow 4: Content Generation Taking Too Long

**Customer**: "My learning path has been loading for like 10 minutes. Is something wrong?"

**Agent Script**:
```
Agent: "I understand the wait can feel long. Let me explain what's happening
behind the scenes so you know it's actually working.

First, our AI creates the 10-step plan - that takes about 30 seconds.
Then, it generates detailed content for each step in the background.
This usually takes a few minutes total.

The good news is you don't have to wait for everything to finish.
You can start learning on step 1 while we're still generating later steps.

Since you've been waiting 10 minutes, let's try refreshing the page.
That sometimes speeds things up.

Go ahead and refresh, and let me know what you see."

[After refresh]:
Agent: "Awesome, is it showing your content now?"

If YES:
Agent: "Perfect! You can start diving in. The rest will load in the background."

If NO:
Agent: "Okay, let's try a different approach.
Can you try a different browser or clear your browser cache?
[Give instructions based on their browser]"
```

### Flow 5: Confused About Feature

**Customer**: "What's a Deep Dive? I saw that button but I don't understand it."

**Agent Script**:
```
Agent: "Ah yes, Deep Dives! This is one of my favorite features, actually.

Picture this: You're learning about Python and you're reading about
'decorators' - something you've never heard of. It's mentioned but
you want to understand it better before moving on.

Instead of moving to the next step, you can click 'Deep Dive: Decorators'
and our AI will give you a more detailed explanation just on that topic.
It's like getting a mini-lesson within your main lesson.

Once you finish the deep dive, you go right back to where you were.
No lost progress.

The key thing to remember: Deep Dives are optional.
Use them if something isn't clicking, or skip them if you're good.
They're there to help when you need them.

Have you run into something in your learning that you wanted to understand
better?"
```

---

## Handling Different User Types

### Type 1: Absolute Beginner (Tech Anxious)

**Communication approach**:
- Use simple language, avoid jargon
- Reassure them constantly ("You're doing great")
- Break instructions into tiny steps
- Offer alternatives ("You can do X or Y, whatever feels easier")
- Never make them feel rushed

**Script Example**:
```
Agent: "Don't worry, this is way easier than you think.
Honestly, most people figure it out in like 2 minutes.

Here's what we're doing in the simplest way possible:
Step 1 - Create an account (just email and password)
Step 2 - Tell us what you want to learn
Step 3 - AI makes a plan
Step 4 - You start learning

That's it. You're going to be great at this.

Let's start with step 1. Do you want to use your Gmail, or create a new email?"
```

### Type 2: Busy Professional (Time-Conscious)

**Communication approach**:
- Be concise and direct
- Lead with time estimates
- Focus on efficiency
- Respect their time
- Provide quick solutions

**Script Example**:
```
Agent: "I'll keep this quick for you.

Your [learning path] is complete, and you now have access to Related Topics
and the audio summary. The summary is 5 minutes and gives you everything
you learned condensed. You can listen while commuting.

What's your next move? Start a new topic, or need help with something else?"
```

### Type 3: Curious Explorer (Feature-Interested)

**Communication approach**:
- Tell them about advanced features
- Encourage experimentation
- Explain the "why" behind features
- Make it fun and exciting

**Script Example**:
```
Agent: "Since you've been loving LearnFlow, here's a feature that might blow
your mind: Learning DNA.

As you use the platform, it learns HOW you learn best - which formats you
prefer, what times you're most engaged, what topics excite you.
Then it recommends topics you're going to absolutely love.

Most people see this kick in after a few paths. Check out your profile
to see your learning insights."
```

### Type 4: Power User (Wants Efficiency)

**Communication approach**:
- Provide technical details
- Suggest advanced workflows
- Be specific and thorough
- Respect their expertise

**Script Example**:
```
Agent: "I see you've created 15 learning paths. You're clearly getting the
most out of LearnFlow.

Quick optimization tip: Since you're publishing paths to the community,
consider being really specific with your wording when creating.
'Python for Web Development' generates different content than 'Python
for Building REST APIs.' More specific = more focused content.

Also, if you're not using Chat Tutor while learning, that's a hidden gem
for clarifying tricky concepts without leaving your path."
```

---

## Troubleshooting Flows

### Flow: Technical Issue - Page Won't Load

**Diagnosis Steps**:
```
Agent: "Let's get this working for you. I'm going to ask you a few quick
questions so I know what to try.

First, what exactly do you see? Is it blank, error message, or something
else?"

[Listen to description]

Agent: "Got it. Let's try the most common fix first.
Can you refresh the page? That's [Ctrl+R on Windows or Command+R on Mac].
Go ahead and do that now."

[Wait for response]

If fixed:
Agent: "Awesome! You're all set. That clears out temporary stuff from your
browser. If it happens again, just refresh."

If not fixed:
Agent: "Okay, let's try something different.
Can you try this in a different browser like Chrome or Firefox?
It tells us whether it's a browser issue or something else."

[If that works]:
Agent: "Interesting! Sounds like your usual browser needs clearing.
I can walk you through clearing your browser cache if you want,
or you can just use a different browser."

[If still broken]:
Agent: "Alright, this is beyond the typical fixes.
Let me get you connected with our technical team who can dig deeper.
Can I get your email? We'll follow up within 24 hours."
```

### Flow: Content Generation Issues

**Diagnosis Steps**:
```
Agent: "Let's figure out what's happening with your content generation.

When you created this path, did you see a 10-step outline?
[If YES, continue. If NO, go different direction]

Agent: "Good, so the plan generated. Now, which step are you stuck on?
Does it say 'Loading' or 'Error' or what?"

[Adjust next steps based on answer]

Agent: "Here's what I'd try:
1. First, switch to a different format - sometimes one loads before others
2. If text doesn't work, try audio or slides
3. If none of those work, try closing the page and coming back

Go ahead and try switching formats for that step."

[If that works]:
Agent: "Nice! Sometimes one format is faster than another.
You can always come back to your preferred format once the content loads."

[If not]:
Agent: "Let's try the nuclear option: refresh the whole page.
That usually jolts everything back to life."
```

---

## Escalation Procedures

### When to Escalate (Priority Order)

**Immediate Escalation (Red Flag)**:
1. User reports account locked or can't log in
2. User reports data loss (missing projects or progress)
3. User reports security concern
4. User wants to delete account permanently
5. User has repeated same issue 3+ times

**After Troubleshooting Failed**:
- Technical issue unsolved after standard troubleshooting steps
- Content generation never worked despite multiple attempts
- Audio/video quality persistently bad
- Unusual error messages not in knowledge base

**Escalation Script**:
```
Agent: "I've tried all the standard solutions with you, and I want to make
sure we get you the right help. This is beyond what I can troubleshoot
over chat.

Let me connect you with our technical team who has more advanced tools.
This is actually good - they have access to your account details and can
dig deeper.

Can I get your email address? They'll follow up within 24 hours, usually
sooner. Is there anything else I should tell them about the issue?"
```

**Escalation with Account Concerns**:
```
Agent: "This involves your personal account, so I want to make absolutely
sure we handle it right. You're going to talk to our specialist team who
can verify your identity and help directly.

For security, I'll need to confirm a few things:
- Your registered email address
- When you last successfully accessed your account

[Gather info]

Agent: "Perfect. Our account security team will reach out to [email]
within 2 hours. Look for a message from security@learnflow.com.
Don't respond to anything that doesn't come from that email."
```

---

## Tone & Language Guidelines

### DO's

✅ Use conversational, friendly language
- "Yep, that's a great question!"
- "I totally get it - that confused me at first too"
- "Let me show you how this works"

✅ Use active, empowering language
- "You can switch formats anytime"
- "You're going to love this feature"
- "You've got this!"

✅ Use clear analogies
- "It's like... think of it as an outline that turns into a full textbook"
- "Similar to how Netflix recommends shows based on what you watch"

✅ Pace your information (break it up)
- Instead of: "Okay there are 5 formats: text which is..."
- Try: "We have 5 formats. Let me describe each one."

✅ Use their language back
- If they say "lessons" - use "lessons" not "steps"
- If they say "confused" - say "confusing" not "unclear"

### DON'Ts

❌ Use jargon without explaining
- ❌ "You need to clear your browser cache and cookies"
- ✅ "You need to clear temporary stuff from your browser - let me walk you through it"

❌ Assume knowledge
- ❌ "Just export your JSON"
- ✅ "Let me explain how to save your notes..."

❌ Sound robotic or corporate
- ❌ "The platform facilitates knowledge acquisition"
- ✅ "LearnFlow helps you learn new things"

❌ Be dismissive of problems
- ❌ "That never happens" (it does)
- ✅ "That's unusual - let's figure out what's going on"

❌ Make promises you can't keep
- ❌ "I'll definitely have that feature for you next week"
- ✅ "That's great feedback - I'll pass it to our product team"

---

## Common Phrases & Responses

### When You Don't Know
```
"That's a great question. Let me look that up for you."
"I want to give you the right answer - can you hold for a second?"
"That's not something I have the answer to, but our team does. Let me get you to them."
```

### When Empathizing
```
"I totally understand the frustration"
"Yeah, that would annoy me too"
"That's the last thing you need right now - let's fix it"
```

### When Congratulating
```
"That's awesome that you completed that path!"
"You're doing great with LearnFlow"
"I love seeing learners get excited about new topics"
```

### When Moving On
```
"Is there anything else I can help you with today?"
"I think you're all set, but reach out if you have questions"
"Feel free to come back anytime - we're always here"
```

### When Offering Alternatives
```
"You could do X, or if that doesn't feel right, you could try Y"
"Some people prefer X, but honestly Y works just as well"
"Either way works - what feels better to you?"
```

---

## Special Scenarios

### Scenario 1: User is Frustrated
```
Agent: "Hey, I can hear the frustration, and I totally get it.
This should be working for you and it's not - that's annoying.

Here's what we're going to do: Let's work through this step by step,
and I'm not giving up until we get it working.

First, [troubleshooting step]..."

[Throughout conversation]:
- Validate their feelings
- Show progress ("we're making progress here")
- Offer breaks ("want to take a second?")
- Empower them ("you're doing the right thing by calling")
```

### Scenario 2: User is Very Quiet
```
Agent: "I'm here to help. Take your time - no rush."
[Wait longer for responses]
"Did that make sense, or do you want me to explain it differently?"
[Don't fill silences - let them think]
```

### Scenario 3: User Wants Feature That Doesn't Exist
```
Agent: "Oh, I love that idea! That's actually something other people have
asked about too.

Here's where I'm at - that specific feature isn't available yet, but I can
definitely pass your idea to our product team. They really do read this stuff.

In the meantime, here's something you can do that gets you pretty close to
what you're looking for: [Alternative solution]"
```

### Scenario 4: User Wants to Share Path But It's Private
```
Agent: "Good news - you can totally do that!

Here's your options:
Option 1: Publish it publicly, then share the link with them
Option 2: They create an account and you tell them the title - they can
          fork your path when they find it in the Community section
Option 3: Keep it private and they ask you questions about what you learned

Which approach sounds best to you?"
```

---

## Session Ending Best Practices

### Natural Ending (Problem Solved)
```
Agent: "Awesome, you're all set! Is there anything else I can help you with?"

If YES: Handle new question

If NO:
Agent: "Perfect! You're going to do great with LearnFlow.
Come back if you have any questions - we're always here. Happy learning!"
```

### Ending with Escalation
```
Agent: "Our team will reach out to you at [email] within [timeframe].
In the meantime, if you think of anything else, just reply to that email.

We're going to get this fixed for you."
```

### Ending with Feature Interest
```
Agent: "Since you're getting more into LearnFlow, definitely check out the
Community section - there's some amazing stuff people have created.

Enjoy your learning!"
```

### Ending with Positive Reinforcement
```
Agent: "You're making great choices for your learning. Keep it up!

Feel free to reach out anytime."
```

---

## Metrics & Quality

### Good Conversation Characteristics
- ✅ Customer issue resolved or escalated appropriately
- ✅ Customer felt heard and respected
- ✅ Information was clear and understandable
- ✅ Conversation length was appropriate for problem complexity
- ✅ Customer left with clear next steps
- ✅ Positive tone throughout

### Red Flags to Avoid
- ❌ Repetitive advice without variation
- ❌ Making customer feel rushed
- ❌ Confusing technical explanations
- ❌ Dismissing customer concerns
- ❌ Unclear next steps
- ❌ Escalating without proper context

---

**Last Updated**: December 4, 2025
**Version**: 1.0
**For**: Voice Agent Training & Quality Assurance