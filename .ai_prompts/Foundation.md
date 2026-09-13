# Application Foundation
## Description
I need to build the foundation framework that will be used by all future feature tasks to structure and layout the application.

## Tech Spec
### Tasks
* Create an application wrapper that includes the following:
	* Header
		* Logo, Location, Shopping Cart icon.
	* Search 
		* Only create a placeholder.
	* Body content
		* Only create a placeholder.
	* Footer
* Every page in the application should be placed inside of this wrapper.
* The wrapper must be responsive.
	* All sections should fill 100% of the applications width.
	* The header should reduce whitespace and remain on a single line. 
		* It should overflow with a scroll bar rather than wrapping.
	* The footer should use text wrapping.
	* Don't build any responsive function around the search or body, future features will handle that.

### Resources

**Company Name**: Airik's Resort
**Location**: Las Vegas
**Logo**: Found in /src/assets/logo.png
**Icons**: Found in /src/assets/favicon/... 
**Shopping Cart Icon**: import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
**Footer Text**: 
***Taxes are not included. Prices shown are the lowest available for each night. Prices shown may be available only with multi-night stays or arrival on a specific day.**

Copyright © 2026 Airik Resorts International. All rights reserved.

### PAGE LAYOUT

/src/assets/image1.png

## Acceptance Criteria
* All future routes have their content projected into the main content section.
* All routes use this view for their wrapper.
* All sections are responsive and use intelligent breakpoints where it makes sense.
* All images and content follow accessibility best practices.
* The main content and search sections have placeholders designed for future features to utilize.
* The cart icon is a placeholder with no functionality built into it.

## Gherkin Scenarios

```gherkin
Scenario: Header is shown
	When the User loads the app
	Then the user sees the header section
	And the header section contains: Logo, Location, and Shopping cart icon. 
```

```gherkin
Scenario: Favicons are provided
	When the User loads the app
	Then the user sees the favicon in the browser
	And the Code contains references for the fav icon and touch icons  
```

```gherkin
Scenario: Footer is provided
	When the User loads the app
	Then the user sees the footer section
	And the footer contains the following text: "*Taxes are not included. Prices shown are the lowest available for each night. Prices shown may be available only with multi-night stays or arrival on a specific day."
```

```gherkin
Scenario: App wrapper is responsive
	When the User loads the app 
	And the user resizes the browser window
	Then the app collapses/expands accordingly.
	And the header does not wrap
	And the footer does text wrap 
```
