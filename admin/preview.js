/* =============================================================
   Blog post live-preview template.
   By default Decap's editor preview pane has no idea about the real
   site's CSS, so the article body renders with generic browser defaults —
   the checklist's "✓" bullets don't align with the heading text next to
   them, and h3 spacing looks nothing like the live site. Loading the real
   stylesheet + wrapping the markdown output in the same .article/.article__body
   classes the live site uses makes the preview WYSIWYG.
   ============================================================= */
CMS.registerPreviewStyle("/css/style.css");

var BlogPostPreview = createClass({
  render: function () {
    var entry = this.props.entry;
    var image = entry.getIn(["data", "image"]);
    var titleEl = entry.getIn(["data", "title_el"]);
    var titleEn = entry.getIn(["data", "title_en"]);

    return h(
      "div",
      { style: { background: "#fff", minHeight: "100vh", padding: "2.5rem 1.5rem" } },
      image
        ? h("img", {
            src: this.props.getAsset(image).toString(),
            style: { width: "100%", maxHeight: "360px", objectFit: "cover", borderRadius: "16px", marginBottom: "2rem" },
          })
        : null,
      h(
        "div",
        { className: "article" },
        h("h1", { className: "display", style: { marginBottom: "0.4rem" } }, titleEl),
        h("p", { style: { color: "#7a8896", marginBottom: "2rem" } }, titleEn),
        h("div", { className: "article__body" }, this.props.widgetFor("body_el"))
      )
    );
  },
});

CMS.registerPreviewTemplate("blog", BlogPostPreview);
