# DayOne -> HTML (-> PDF)

![dayone-app][4]

## Use it

You can clone this repository or [use the app here][1].

## About

I created this as a means of getting a Day One journal printed to
a physical book. DayOne has a built in export feature but it
wasn't exactly styled how I wanted (i.e. a photobook).

This HTML/JavaScript app will render your Day One entries and
photos into a page that you can then print to PDF (PDF printing is
built-in on Mac, 3rd party options are available for Windows).

Once you have a PDF you can use one of the many available services
online for printing it to a nice photobook. I happen to use
[Blurb][2].

## Issues / Feature Requests

If you have any feature requests, create issues in GitHub or
[contact me on Twitter][3].

## Customization Instructions

If you want to run this yourself, just clone this repository and
make your adjustments to the JavaScript, HTML, and CSS as
necessary. I've purposefully limited info, but there's nothing to
stop you from also pulling in and displaying geo, weather, etc.

This app requires Node.js. Install Node.js then run the following
commands:

1. `npm install webpack webpack-dev-server -g`
2. `npm install`
3. `webpack`
4. `webpack-dev-server`
5. Open http://localhost:8080 in Google Chrome

This should be all you need to run it as-is. If you're wanting to
make changes to the scripts, see the [React.js Getting Started Guide][6].

## Example PDF Screenshot

This is an example where I printed two pages on one page using the
print preferences on a mac.

![pdf-example][5]

[1]: https://dayone.donnierayjones.com
[2]: http://www.blurb.com/pdf-to-book
[3]: https://twitter.com/hidrj
[4]: https://dl.dropboxusercontent.com/u/51737/images/projects/dayone-to-html/app-screenshot.png
[5]: https://dl.dropboxusercontent.com/u/51737/images/projects/dayone-to-html/pdf-example.png
[6]: https://facebook.github.io/react/docs/getting-started.html#offline-transform
