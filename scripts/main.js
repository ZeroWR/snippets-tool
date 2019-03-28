class MainViewModel
{
	constructor()
	{
		this.snippets = ko.observableArray([]);
		this.snippetTypes = 
		[
			new SnippetType("Expansion", "Allows the code snippet to be inserted at the cursor.", "Expansion"),
			new SnippetType("Surrounds With", "Allows the code snippet to be placed around a selected piece of code.", "SurroundsWith")
		];
		this.languages = 
		[
			new LanguageOption('C#', 'CSharp', 'text/x-csharp', 'csharp'),
			new LanguageOption('SQL', 'SQL', 'text/x-mssql', 'sql'),
			new LanguageOption('C++', 'CPP', 'text/x-c++src', 'c++'),
			new LanguageOption('VB', 'VB', 'text/x-vb', 'vb'),
			new LanguageOption('JavaScript', 'JavaScript', 'text/javascript', 'javascript'),
			new LanguageOption('HTML', 'HTML', 'text/html', 'html'),
			new LanguageOption('XML', 'XML', 'application/xml', 'xml')
		];
		this.output = ko.observable();
		this.fileName = ko.observable();
		this.ViewDiv = ko.observable('index');
		this.hasShownInstructions = false;
		this.popper = null;

		var self = this;
		this.ViewDiv.subscribe(
			function(target){
				if(target ==='tool' && self.hasShownInstructions === false)
				{
					self.showPopper();
				}
				else if (target !== 'tool')
				{
					self.hidePopper();
				}
			}
		);
	}
	showPopper()
	{
		var self = this;
		var instructionsDiv = $('#add-instructions');
		self.popper = new Popper(
			$('#add-snippet'),
			instructionsDiv,
			{
				placement: 'right'
			}
		);

		instructionsDiv.show();
		instructionsDiv.click(function(){
			self.popper.destroy();
			self.popper = null;
			$('#add-instructions').hide();
		})
		self.hasShownInstructions = true;
	}

	hidePopper()
	{
		var self = this;
		if(self.popper !== null)
		{
			self.popper.destroy();
			self.popper = null;	
		}
		$('#add-instructions').hide();
	}

	addSnippet()
	{
		this.hidePopper();
		var newSnippet = new Snippet();
		newSnippet.language = this.languages[0];
		this.snippets.push(newSnippet);
	}
	
	removeSnippet(snippet)
	{
		this.snippets.remove(snippet);
	}

	saveSnippets()
	{
		var template = $('#outputTemplate');
		var templateText = template.html();
		var rendered = Mustache.render(templateText, this);
		this.output(rendered);
		//var blob = new Blob([rendered], {type: "text/xml;charset=utf-8"});
		var blob = new Blob([rendered], {type: "application/xml;"});
		var fileName = (!this.fileName() || this.fileName().length === 0)  ? "snippetOutput" : this.fileName();
		fileName += ".snippet";
		saveAs(blob, fileName);

		// $.get
		// (
		// 	'templates/output.mst',
		// 	function(template)
		// 	{
		// 		var rendered = Mustache.render(template, this);
		// 		output(rendered);
		// 	}
	}
};

class SnippetType
{
	constructor(name, description, value)
	{
		this.name = name;
		this.description = description;
		this.value = value;
	}
};

class LanguageOption
{
	constructor(text, attributeValue, codeMirrorMode, codeMirrorLanguage)
	{
		this.text = text;
		this.attributeValue = attributeValue;
		this.codeMirrorMode = codeMirrorMode;
		this.codeMirrorLanguage = codeMirrorLanguage;
	}
};

class Snippet
{
	constructor()
	{
		var self = this;
		this.id = GenerateUniqueID();
		this.title = ko.observable();
		this.description = ko.observable("");
		this.snippetTypes = ko.observableArray([]);
		this.language = ko.observable(null);
		this.snippetCode = ko.observable(null);
		this.editor = ko.observable(null);
		this.linkTitle = ko.computed
		(
			function()
			{
				if(self === undefined)
					return "(Untitled Snippet)";
				return (self.title() === '' || self.title() === null || self.title() === undefined) ? "(Untitled Snippet)" : self.title();
			}
		);
		// self.language.extend({ notify: 'always' });
		// self.language.subscribe
		// (
		// 	function(newValue)
		// 	{
		// 		alert(JSON.stringify(newValue));
		// 		if(this.editor !== null)
		// 		{
		// 			if(this.language !== null)
		// 			{
		// 				this.editor.setOption("mode", language.codeMirrorMode);
		// 				this.editor.setOption("language", language.codeMirrorLanguage);
		// 			}
		// 		}
		// 	}.bind(this)
		// );
	}
};

var GenerateUniqueID = 
(
	function()
	{
		var id = 0;
		return function(){return id++;};
	}
)();

function onChange(dataContext)
{
	var editor = dataContext.editor();
	if(editor !== null)
	{
		if(dataContext.language !== null)
		{
			editor.setOption("mode", dataContext.language.codeMirrorMode);
			editor.setOption("language", dataContext.language.codeMirrorLanguage);
		}
	}
}