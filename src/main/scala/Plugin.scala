import io.github.gitbucket.solidbase.model.Version
import gitbucket.core.controller.{Context, ControllerBase}
import gitbucket.core.plugin.{Link, PluginRegistry}
import gitbucket.core.service.RepositoryService.RepositoryInfo
import gitbucket.core.service.SystemSettingsService.SystemSettings
import io.github.gitbucket.labelkanban.controller.TagKanbanController

class Plugin extends gitbucket.core.plugin.Plugin {
  override val pluginId: String = "labelkanban"
  override val pluginName: String = "Label Kanban Plugin"
  override val description: String = "GitBucket plug-in"
  override val versions: List[Version] = List(
    new Version("1.0.0"),
    new Version("1.0.1"),
  )

  override val controllers = Seq(
    "/*" -> new TagKanbanController()
  )

  override val assetsMappings = Seq("/labelkanban" -> "/plugins/labelkanban/assets")

  override val repositoryMenus = Seq(
    (repositoryInfo: RepositoryInfo, context: Context) => Some(Link("labelkanban", "Kanban", "/labalkanban/@", Some("inbox")))
  )
}
